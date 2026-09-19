from flask import Flask, request, g, jsonify, send_from_directory, redirect
import jwt
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from functools import wraps
import json
import hmac
import os
import shutil
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlparse
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv

# =========================================================
# BASE CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

# =========================================================
# UPLOAD CONFIGURATION
# =========================================================

UPLOAD_DIR = Path(
    os.getenv(
        "LOCAL_UPLOAD_DIR",
        BASE_DIR / "uploads"
    )
).resolve()

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "local-development-secret-change-before-production"
)

# =========================================================
# AWS CONFIGURATION
# =========================================================

AWS_ENABLED = os.getenv(
    "AWS_ENABLED",
    "false"
).lower() in {
    "1",
    "true",
    "yes"
}

AWS_BUCKET_NAME = os.getenv(
    "AWS_BUCKET_NAME",
    "jaljivnam"
)

AWS_REGION = os.getenv(
    "AWS_REGION",
    "ap-south-1"
)

s3_client = None

if AWS_ENABLED:

    import boto3

    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION
    )

# =========================================================
# CLOUDINARY
# =========================================================

import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils

CLOUDINARY_CLOUD_NAME = os.getenv(
    "CLOUDINARY_CLOUD_NAME",
    ""
).strip()

CLOUDINARY_API_KEY = os.getenv(
    "CLOUDINARY_API_KEY",
    ""
).strip()

CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET",
    ""
).strip()

CLOUDINARY_URL = os.getenv(
    "CLOUDINARY_URL",
    ""
).strip()

if CLOUDINARY_URL:

    cloudinary.config(
        cloudinary_url=CLOUDINARY_URL,
        secure=True
    )

elif (
    CLOUDINARY_CLOUD_NAME
    and CLOUDINARY_API_KEY
    and CLOUDINARY_API_SECRET
):

    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )

CLOUDINARY_ENABLED = bool(
    CLOUDINARY_URL
    or (
        CLOUDINARY_CLOUD_NAME
        and CLOUDINARY_API_KEY
        and CLOUDINARY_API_SECRET
    )
)

# =========================================================
# TENANT CONFIGURATION
# =========================================================

tenants_config_path = Path(
    os.getenv(
        "TENANTS_CONFIG_PATH",
        BASE_DIR / "tenants_config.json"
    )
).expanduser().resolve()

with tenants_config_path.open() as f:
    tenants_config = json.load(f)

# =========================================================
# DATABASE
# =========================================================

def get_db(tenant_id):

    connection_uri = os.getenv(
        "MONGODB_URI",
        ""
    ).strip()

    # -----------------------------------------------------
    # PRODUCTION / MONGODB ATLAS
    # -----------------------------------------------------

    if connection_uri:

        db_name = os.getenv(
            "MONGODB_DB_NAME",
            ""
        ).strip()

        if not db_name:

            tenant_config = tenants_config.get(
                tenant_id,
                {}
            )

            db_name = tenant_config.get(
                "db_name",
                "localhost"
            )

        if "db" not in g:

            client = MongoClient(
                connection_uri,
                serverSelectionTimeoutMS=5000
            )

            g.db = client[db_name]

        return g.db

    # -----------------------------------------------------
    # LOCAL
    # -----------------------------------------------------

    tenant_config = tenants_config.get(
        tenant_id
    )

    if not tenant_config:

        raise ValueError(
            "Invalid tenant ID"
        )

    connection_uri = tenant_config[
        "connection_uri"
    ]

    db_name = tenant_config[
        "db_name"
    ]

    if "db" not in g:

        client = MongoClient(
            connection_uri,
            serverSelectionTimeoutMS=5000
        )

        g.db = client[db_name]

    return g.db


# =========================================================
# PASSWORD HELPERS
# =========================================================

def is_password_hash(value):

    return (
        isinstance(value, str)
        and value.startswith(
            (
                "scrypt:",
                "pbkdf2:"
            )
        )
    )


def password_matches(
    stored_password,
    submitted_password
):

    if (
        not stored_password
        or not submitted_password
    ):
        return False

    if is_password_hash(
        stored_password
    ):

        return check_password_hash(
            stored_password,
            submitted_password
        )

    return hmac.compare_digest(
        stored_password,
        submitted_password
    )


# =========================================================
# TENANT MIDDLEWARE
# =========================================================

@app.before_request
def set_tenant():

    if request.method == "OPTIONS":
        return

    if request.endpoint in {
        "health",
        "serve_local_file",
        "upload_local_file"
    }:
        return

    tenant_id = request.headers.get(
        "x-tenant-id"
    )

    if not tenant_id:

        return jsonify({
            "error":
                "Tenant ID is required",
            "status":
                False
        }), 400

    tenant_id = tenant_id.strip().lower()

    connection_uri = os.getenv(
        "MONGODB_URI",
        ""
    ).strip()

    # -----------------------------------------------------
    # PRODUCTION
    # -----------------------------------------------------

    if connection_uri:

        production_tenants = {
            "localhost",
            "127.0.0.1",
            "ngo-management-systemm.vercel.app"
        }

        if tenant_id in production_tenants:

            request.tenant_id = (
                "ngo-management-systemm.vercel.app"
            )

            return

        if tenant_id in tenants_config:

            request.tenant_id = tenant_id

            return

        return jsonify({
            "error":
                "Invalid tenant ID",
            "status":
                False
        }), 400

    # -----------------------------------------------------
    # LOCAL
    # -----------------------------------------------------

    if tenant_id not in tenants_config:

        return jsonify({
            "error":
                "Invalid tenant ID",
            "status":
                False
        }), 400

    request.tenant_id = tenant_id


# =========================================================
# CLOSE DATABASE
# =========================================================

@app.teardown_appcontext
def close_connection(exception):

    db = g.pop(
        "db",
        None
    )

    if db is not None:

        db.client.close()


# =========================================================
# HEALTH
# =========================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    tenant_id = request.headers.get(
        "x-tenant-id",
        "localhost"
    ).strip().lower()

    try:

        db = get_db(
            tenant_id
        )

        db.command(
            "ping"
        )

    except Exception as error:

        return jsonify({
            "service":
                "ngo-backend",
            "database":
                "unavailable",
            "error":
                str(error),
            "status":
                False
        }), 503

    if CLOUDINARY_ENABLED:

        storage_type = "cloudinary"

    elif AWS_ENABLED:

        storage_type = "s3"

    else:

        storage_type = "local"

    return jsonify({
        "service":
            "ngo-backend",
        "database":
            "connected",
        "storage":
            storage_type,
        "status":
            True
    }), 200


# =========================================================
# SAFE UPLOAD PATH
# =========================================================

def safe_upload_path(key):

    normalized_key = unquote(
        key
    ).replace(
        "\\",
        "/"
    )

    relative_path = PurePosixPath(
        normalized_key
    )

    if (
        relative_path.is_absolute()
        or ".." in relative_path.parts
    ):

        raise ValueError(
            "Invalid upload path"
        )

    target = UPLOAD_DIR.joinpath(
        *relative_path.parts
    ).resolve()

    if (
        target != UPLOAD_DIR
        and UPLOAD_DIR not in target.parents
    ):

        raise ValueError(
            "Invalid upload path"
        )

    return target


# =========================================================
# CLOUDINARY RESOURCE TYPE
# =========================================================

def get_cloudinary_resource_type(key):

    extension = Path(
        key
    ).suffix.lower()

    image_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        ".svg"
    }

    pdf_extensions = {
        ".pdf"
    }

    video_extensions = {
        ".mp4",
        ".mov",
        ".avi",
        ".webm",
        ".mkv"
    }

    # IMPORTANT:
    # Cloudinary handles PDFs as IMAGE assets.
    if extension in pdf_extensions:

        return "image"

    if extension in image_extensions:

        return "image"

    if extension in video_extensions:

        return "video"

    return "raw"


# =========================================================
# CLOUDINARY PUBLIC ID
# =========================================================

def get_cloudinary_public_id(
    key,
    resource_type
):

    normalized_key = unquote(
        key
    ).replace(
        "\\",
        "/"
    ).strip("/")

    path = Path(
        normalized_key
    )

    # Image + PDF
    if resource_type == "image":

        return str(
            path.with_suffix("")
        ).replace(
            "\\",
            "/"
        )

    # Video
    if resource_type == "video":

        return str(
            path.with_suffix("")
        ).replace(
            "\\",
            "/"
        )

    # Raw
    return normalized_key


# =========================================================
# CLOUDINARY URL
# =========================================================

def build_cloudinary_url(
    public_id,
    resource_type,
    file_extension=None
):

    if not CLOUDINARY_ENABLED:

        return None

    try:

        # -------------------------------------------------
        # PDF
        # -------------------------------------------------

        if file_extension == ".pdf":

            cloudinary_url, options = (
                cloudinary.utils.cloudinary_url(
                    public_id,
                    resource_type="image",
                    type="upload",
                    format="pdf",
                    secure=True
                )
            )

            return cloudinary_url

        # -------------------------------------------------
        # IMAGE
        # -------------------------------------------------

        if resource_type == "image":

            cloudinary_url, options = (
                cloudinary.utils.cloudinary_url(
                    public_id,
                    resource_type="image",
                    type="upload",
                    secure=True,
                    transformation=[
                        {
                            "quality":
                                "auto",
                            "fetch_format":
                                "auto",
                            "width":
                                1200,
                            "crop":
                                "limit"
                        }
                    ]
                )
            )

            return cloudinary_url

        # -------------------------------------------------
        # VIDEO
        # -------------------------------------------------

        if resource_type == "video":

            cloudinary_url, options = (
                cloudinary.utils.cloudinary_url(
                    public_id,
                    resource_type="video",
                    type="upload",
                    secure=True
                )
            )

            return cloudinary_url

        # -------------------------------------------------
        # RAW
        # -------------------------------------------------

        cloudinary_url, options = (
            cloudinary.utils.cloudinary_url(
                public_id,
                resource_type="raw",
                type="upload",
                secure=True
            )
        )

        return cloudinary_url

    except Exception as error:

        print(
            "Cloudinary URL generation error:",
            str(error)
        )

        return None


# =========================================================
# CONVERT MEDIA URL TO CLOUDINARY
# =========================================================

def convert_media_url_to_cloudinary(
    media_url
):

    if not isinstance(
        media_url,
        str
    ):

        return media_url

    media_url = media_url.strip()

    if not media_url:

        return media_url

    parsed_url = urlparse(
        media_url
    )

    local_marker = "/api/local-files/"

    # =====================================================
    # OLD BACKEND URL
    # =====================================================

    if local_marker in parsed_url.path:

        try:

            local_key = parsed_url.path.split(
                local_marker,
                1
            )[1]

            local_key = unquote(
                local_key
            )

            normalized_key = (
                local_key
                .replace("\\", "/")
                .strip("/")
            )

            resource_type = (
                get_cloudinary_resource_type(
                    normalized_key
                )
            )

            extension = Path(
                normalized_key
            ).suffix.lower()

            public_id = (
                get_cloudinary_public_id(
                    normalized_key,
                    resource_type
                )
            )

            direct_url = (
                build_cloudinary_url(
                    public_id,
                    resource_type,
                    extension
                )
            )

            if direct_url:

                return direct_url

        except Exception as error:

            print(
                "Old media URL conversion error:",
                str(error)
            )

            return media_url

    # =====================================================
    # CLOUDINARY URL
    # =====================================================

    if (
        CLOUDINARY_ENABLED
        and "res.cloudinary.com"
        in parsed_url.netloc
    ):

        try:

            path_parts = [
                part
                for part in parsed_url.path.split("/")
                if part
            ]

            upload_index = path_parts.index(
                "upload"
            )

            if upload_index == 0:

                return media_url

            resource_type = path_parts[
                upload_index - 1
            ]

            if resource_type not in {
                "image",
                "video",
                "raw"
            }:

                resource_type = "image"

            public_parts = path_parts[
                upload_index + 1:
            ]

            # Remove version
            if (
                public_parts
                and public_parts[0].startswith("v")
                and public_parts[0][1:].isdigit()
            ):

                public_parts = public_parts[1:]

            if not public_parts:

                return media_url

            public_id_with_extension = (
                "/".join(
                    public_parts
                )
            )

            # -------------------------------------------------
            # PDF
            # -------------------------------------------------

            if (
                resource_type == "image"
                and public_id_with_extension.lower().endswith(
                    ".pdf"
                )
            ):

                public_id = str(
                    Path(
                        public_id_with_extension
                    ).with_suffix("")
                ).replace(
                    "\\",
                    "/"
                )

                return build_cloudinary_url(
                    public_id,
                    "image",
                    ".pdf"
                )

            # -------------------------------------------------
            # RAW
            # -------------------------------------------------

            if resource_type == "raw":

                public_id = (
                    public_id_with_extension
                )

                return build_cloudinary_url(
                    public_id,
                    "raw"
                )

            # -------------------------------------------------
            # IMAGE / VIDEO
            # -------------------------------------------------

            public_id = str(
                Path(
                    public_id_with_extension
                ).with_suffix("")
            ).replace(
                "\\",
                "/"
            )

            return build_cloudinary_url(
                public_id,
                resource_type
            )

        except Exception as error:

            print(
                "Cloudinary URL conversion error:",
                str(error)
            )

    return media_url


# =========================================================
# UPLOAD TO CLOUDINARY
# =========================================================

def upload_to_cloudinary(
    key,
    file_bytes
):

    if not CLOUDINARY_ENABLED:

        raise RuntimeError(
            "Cloudinary is not configured. "
            "Please check Cloudinary environment variables."
        )

    if not file_bytes:

        raise ValueError(
            "File is empty"
        )

    normalized_key = unquote(
        key
    ).replace(
        "\\",
        "/"
    ).strip("/")

    extension = Path(
        normalized_key
    ).suffix.lower()

    resource_type = (
        get_cloudinary_resource_type(
            normalized_key
        )
    )

    public_id = (
        get_cloudinary_public_id(
            normalized_key,
            resource_type
        )
    )

    upload_options = {
        "public_id":
            public_id,

        "resource_type":
            resource_type,

        "type":
            "upload",

        "overwrite":
            True,

        "invalidate":
            True,

        "unique_filename":
            False
    }

    # =====================================================
    # PDF
    # =====================================================

    if extension == ".pdf":

        # Cloudinary PDFs should be image assets.
        upload_options["resource_type"] = "image"

        # Preserve PDF format.
        upload_options["format"] = "pdf"

    print(
        "=============================================="
    )

    print(
        "Uploading file to Cloudinary"
    )

    print(
        "File:",
        normalized_key
    )

    print(
        "Extension:",
        extension
    )

    print(
        "Resource Type:",
        upload_options["resource_type"]
    )

    print(
        "Public ID:",
        public_id
    )

    print(
        "=============================================="
    )

    result = cloudinary.uploader.upload(
        file_bytes,
        **upload_options
    )

    secure_url = result.get(
        "secure_url"
    )

    if not secure_url:

        raise RuntimeError(
            "Cloudinary did not return secure_url"
        )

    print(
        "Cloudinary upload successful:"
    )

    print(
        secure_url
    )

    return {
        "url":
            secure_url,

        "public_id":
            public_id,

        "resource_type":
            upload_options["resource_type"],

        "format":
            result.get(
                "format"
            )
    }


# =========================================================
# UPLOAD FILE
# =========================================================

@app.route(
    "/api/local-files/<path:key>",
    methods=["PUT"]
)
def upload_local_file(key):

    try:

        file_bytes = request.get_data()

        if not file_bytes:

            return jsonify({
                "error":
                    "Uploaded file is empty",
                "status":
                    False
            }), 400

        # =================================================
        # CLOUDINARY
        # =================================================

        if CLOUDINARY_ENABLED:

            result = upload_to_cloudinary(
                key,
                file_bytes
            )

            extension = Path(
                unquote(key)
            ).suffix.lower()

            optimized_url = (
                build_cloudinary_url(
                    result["public_id"],
                    result["resource_type"],
                    extension
                )
            )

            return jsonify({
                "url":
                    optimized_url
                    or result["url"],

                "original_url":
                    result["url"],

                "file_name":
                    key,

                "storage":
                    "cloudinary",

                "resource_type":
                    result["resource_type"],

                "status":
                    True
            }), 200

        # =================================================
        # AWS
        # =================================================

        if AWS_ENABLED and s3_client:

            s3_client.put_object(
                Bucket=AWS_BUCKET_NAME,
                Key=unquote(key),
                Body=file_bytes
            )

            return jsonify({
                "url":
                    f"https://{AWS_BUCKET_NAME}.s3."
                    f"{AWS_REGION}.amazonaws.com/"
                    f"{unquote(key)}",

                "file_name":
                    key,

                "storage":
                    "s3",

                "status":
                    True
            }), 200

        # =================================================
        # LOCAL
        # =================================================

        target = safe_upload_path(
            key
        )

        target.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        target.write_bytes(
            file_bytes
        )

        return jsonify({
            "url":
                f"{request.host_url.rstrip('/')}"
                f"/api/local-files/"
                f"{quote(key, safe='/')}",

            "file_name":
                key,

            "storage":
                "local",

            "status":
                True
        }), 200

    except ValueError as error:

        return jsonify({
            "error":
                str(error),
            "status":
                False
        }), 400

    except Exception as error:

        import traceback

        traceback.print_exc()

        return jsonify({
            "error":
                str(error),
            "status":
                False
        }), 500


# =========================================================
# GET FILE
# =========================================================

@app.route(
    "/api/local-files/<path:key>",
    methods=["GET"]
)
def serve_local_file(key):

    # =====================================================
    # CLOUDINARY
    # =====================================================

    if CLOUDINARY_ENABLED:

        try:

            normalized_key = (
                unquote(key)
                .replace("\\", "/")
                .strip("/")
            )

            extension = Path(
                normalized_key
            ).suffix.lower()

            resource_type = (
                get_cloudinary_resource_type(
                    normalized_key
                )
            )

            public_id = (
                get_cloudinary_public_id(
                    normalized_key,
                    resource_type
                )
            )

            cloudinary_url = (
                build_cloudinary_url(
                    public_id,
                    resource_type,
                    extension
                )
            )

            if cloudinary_url:

                return redirect(
                    cloudinary_url,
                    code=302
                )

        except Exception as error:

            print(
                "Cloudinary GET error:",
                str(error)
            )

    # =====================================================
    # AWS
    # =====================================================

    if AWS_ENABLED and s3_client:

        encoded_key = quote(
            unquote(key),
            safe="/"
        )

        s3_url = (
            f"https://{AWS_BUCKET_NAME}.s3."
            f"{AWS_REGION}.amazonaws.com/"
            f"{encoded_key}"
        )

        return redirect(
            s3_url,
            code=302
        )

    # =====================================================
    # LOCAL
    # =====================================================

    return send_from_directory(
        UPLOAD_DIR,
        key
    )


# =========================================================
# DELETE MEDIA URL
# =========================================================

def delete_media_url(
    image_url
):

    if not image_url:

        return

    parsed_url = urlparse(
        image_url
    )

    local_marker = "/api/local-files/"

    # =====================================================
    # BACKEND MEDIA URL
    # =====================================================

    if local_marker in parsed_url.path:

        local_key = parsed_url.path.split(
            local_marker,
            1
        )[1]

        local_key = unquote(
            local_key
        )

        if CLOUDINARY_ENABLED:

            normalized_key = (
                local_key
                .replace("\\", "/")
                .strip("/")
            )

            resource_type = (
                get_cloudinary_resource_type(
                    normalized_key
                )
            )

            public_id = (
                get_cloudinary_public_id(
                    normalized_key,
                    resource_type
                )
            )

            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",
                invalidate=True
            )

            return

        target = safe_upload_path(
            local_key
        )

        target.unlink(
            missing_ok=True
        )

        return

    # =====================================================
    # CLOUDINARY URL
    # =====================================================

    if (
        CLOUDINARY_ENABLED
        and "res.cloudinary.com"
        in parsed_url.netloc
    ):

        path_parts = [
            part
            for part in parsed_url.path.split("/")
            if part
        ]

        try:

            upload_index = path_parts.index(
                "upload"
            )

            if upload_index == 0:

                return

            resource_type = path_parts[
                upload_index - 1
            ]

            if resource_type not in {
                "image",
                "video",
                "raw"
            }:

                resource_type = "image"

            public_parts = path_parts[
                upload_index + 1:
            ]

            # Remove version
            if (
                public_parts
                and public_parts[0].startswith("v")
                and public_parts[0][1:].isdigit()
            ):

                public_parts = public_parts[1:]

            public_id = "/".join(
                public_parts
            )

            # =================================================
            # PDF IMAGE ASSET
            # =================================================

            if (
                resource_type == "image"
                and public_id.lower().endswith(".pdf")
            ):

                public_id = str(
                    Path(
                        public_id
                    ).with_suffix("")
                ).replace(
                    "\\",
                    "/"
                )

            # =================================================
            # NORMAL IMAGE / VIDEO
            # =================================================

            elif resource_type != "raw":

                public_id = str(
                    Path(
                        public_id
                    ).with_suffix("")
                ).replace(
                    "\\",
                    "/"
                )

            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",
                invalidate=True
            )

            return

        except Exception as error:

            print(
                "Cloudinary delete error:",
                str(error)
            )

            raise

    # =====================================================
    # AWS
    # =====================================================

    if AWS_ENABLED and s3_client:

        s3_prefix = (
            f"{AWS_BUCKET_NAME}.s3.amazonaws.com/"
        )

        if s3_prefix in image_url:

            object_key = image_url.split(
                s3_prefix
            )[-1]

        else:

            object_key = (
                parsed_url.path.lstrip("/")
            )

        s3_client.delete_object(
            Bucket=AWS_BUCKET_NAME,
            Key=object_key
        )

        return


# =========================================================
# DELETE MEDIA PREFIX
# =========================================================

def delete_media_prefix(
    prefix
):

    if CLOUDINARY_ENABLED:

        errors = []

        for resource_type in [
            "image",
            "video",
            "raw"
        ]:

            try:

                cloudinary.api.delete_resources_by_prefix(
                    prefix,
                    resource_type=resource_type,
                    type="upload",
                    invalidate=True
                )

            except Exception as error:

                error_text = str(
                    error
                ).lower()

                if (
                    "not found" not in error_text
                    and "no resources" not in error_text
                ):

                    errors.append(
                        str(error)
                    )

        if errors:

            raise RuntimeError(
                "; ".join(errors)
            )

        return

    if AWS_ENABLED and s3_client:

        objects_to_delete = (
            s3_client.list_objects_v2(
                Bucket=AWS_BUCKET_NAME,
                Prefix=prefix
            )
        )

        if "Contents" in objects_to_delete:

            keys = [
                {
                    "Key":
                        item["Key"]
                }
                for item in objects_to_delete["Contents"]
            ]

            s3_client.delete_objects(
                Bucket=AWS_BUCKET_NAME,
                Delete={
                    "Objects":
                        keys,
                    "Quiet":
                        True
                }
            )

        return

    target = safe_upload_path(
        prefix
    )

    if (
        target.exists()
        and target.is_dir()
    ):

        shutil.rmtree(
            target
        )


# =========================================================
# TOKEN REQUIRED
# =========================================================

def token_required(f):

    @wraps(f)
    def decorated(
        *args,
        **kwargs
    ):

        token = request.headers.get(
            "Authorization"
        )

        if not token:

            return jsonify({
                "message":
                    "Token is missing!",
                "status":
                    False
            }), 401

        try:

            token_parts = token.split(
                " "
            )

            if len(token_parts) != 2:

                raise jwt.InvalidTokenError

            token = token_parts[1]

            decoded = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            current_user = get_db(
                request.tenant_id
            ).volunteers.find_one({
                "_id":
                    ObjectId(
                        decoded["sub"]
                    )
            })

            if not current_user:

                raise jwt.InvalidTokenError

        except jwt.ExpiredSignatureError:

            return jsonify({
                "message":
                    "Token has expired!",
                "status":
                    False
            }), 401

        except Exception:

            return jsonify({
                "message":
                    "Invalid token!",
                "status":
                    False
            }), 401

        return f(
            current_user,
            *args,
            **kwargs
        )

    return decorated


# =========================================================
# LOGIN
# =========================================================

@app.route(
    "/api/login",
    methods=["POST"]
)
def login():

    db = get_db(
        request.tenant_id
    )

    data = request.get_json(
        silent=True
    ) or {}

    username = data.get(
        "username"
    )

    password = data.get(
        "password"
    )

    if not username or not password:

        return jsonify({
            "error":
                "Username and password are required",
            "status":
                False
        }), 400

    user = db.volunteers.find_one({
        "mobile":
            username
    })

    if (
        user
        and password_matches(
            user.get("password"),
            password
        )
        and user.get("role") == "Head-Volunteer"
    ):

        if not is_password_hash(
            user.get("password")
        ):

            db.volunteers.update_one(
                {
                    "_id":
                        user["_id"]
                },
                {
                    "$set": {
                        "password":
                            generate_password_hash(
                                password
                            )
                    }
                }
            )

        payload = {
            "exp":
                datetime.utcnow()
                + timedelta(days=1),

            "iat":
                datetime.utcnow(),

            "sub":
                str(
                    user["_id"]
                )
        }

        token = jwt.encode(
            payload,
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "token":
                token,

            "role":
                user["role"],

            "status":
                True
        }), 200

    return jsonify({
        "error":
            "Invalid username or password",
        "status":
            False
    }), 401


# =========================================================
# VERIFY TOKEN
# =========================================================

@app.route(
    "/api/verify-token",
    methods=["GET"]
)
@token_required
def verify_token(
    current_user
):

    return jsonify({
        "username":
            current_user.get(
                "username"
            ),

        "role":
            current_user.get(
                "role"
            ),

        "status":
            True
    }), 200


# =========================================================
# CREATE VOLUNTEER
# =========================================================

@app.route(
    "/api/volunteers/create-volunteer",
    methods=["POST"]
)
@token_required
def create_volunteer(
    current_user
):

    db = get_db(
        request.tenant_id
    )

    user_data = request.get_json(
        silent=True
    ) or {}

    if not user_data:

        return jsonify({
            "error":
                "User data is required",
            "status":
                False
        }), 400

    try:

        if user_data.get(
            "password"
        ):

            user_data["password"] = (
                generate_password_hash(
                    user_data["password"]
                )
            )

        user_data["created_by"] = (
            current_user["_id"]
        )

        user_data["created_at"] = (
            datetime.now()
        )

        result = db.volunteers.insert_one(
            user_data
        )

        return jsonify({
            "message":
                "User created successfully",

            "user_id":
                str(
                    result.inserted_id
                ),

            "status":
                True
        }), 201

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# UPDATE VOLUNTEER
# =========================================================

@app.route(
    "/api/volunteers/update-volunteer/<id>",
    methods=["PUT"]
)
@token_required
def update_volunteer(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    data = request.get_json(
        silent=True
    ) or {}

    if not data:

        return jsonify({
            "error":
                "No data provided",
            "status":
                False
        }), 400

    if data.get(
        "password"
    ):

        data["password"] = (
            generate_password_hash(
                data["password"]
            )
        )

    data["modified_by"] = (
        current_user["_id"]
    )

    data["modified_at"] = (
        datetime.now()
    )

    result = db.volunteers.update_one(
        {
            "_id":
                ObjectId(id)
        },
        {
            "$set":
                data
        }
    )

    if result.matched_count == 0:

        return jsonify({
            "error":
                "No document found with the provided id",
            "status":
                False
        }), 404

    return jsonify({
        "message":
            "Data updated successfully",
        "status":
            True
    }), 200


# =========================================================
# GET VOLUNTEERS
# =========================================================

@app.route(
    "/api/volunteers/get-volunteers",
    methods=["GET"]
)
def get_volunteers():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.volunteers.find({
                "status":
                    "active"
            })
        )

        results = []

        for doc in documents:

            results.append({
                "_id":
                    str(
                        doc["_id"]
                    ),

                "id":
                    str(
                        doc["_id"]
                    ),

                "name":
                    doc.get(
                        "name",
                        ""
                    ),

                "status":
                    doc.get(
                        "status",
                        ""
                    ),

                "role":
                    doc.get(
                        "role",
                        ""
                    ),

                "mobile":
                    doc.get(
                        "mobile",
                        ""
                    ),

                "address":
                    doc.get(
                        "address",
                        ""
                    )
            })

        return jsonify({
            "volunteers":
                results,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GET VOLUNTEER REQUESTS
# =========================================================

@app.route(
    "/api/volunteers/get-volunteer-requests",
    methods=["GET"]
)
def get_volunteer_requests():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.volunteers.find({
                "status":
                    "pending"
            })
        )

        results = []

        for doc in documents:

            doc["_id"] = str(
                doc["_id"]
            )

            doc["id"] = doc["_id"]

            doc.pop(
                "password",
                None
            )

            results.append(
                doc
            )

        return jsonify({
            "volunteers":
                results,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# AUTHORIZE VOLUNTEER
# =========================================================

@app.route(
    "/api/volunteers/authorize/<id>",
    methods=["PUT"]
)
@token_required
def authorize_volunteer(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    result = db.volunteers.update_one(
        {
            "_id":
                ObjectId(id)
        },
        {
            "$set": {
                "status":
                    "active",

                "authorized_by":
                    current_user["_id"],

                "authorized_at":
                    datetime.now()
            }
        }
    )

    if result.matched_count == 0:

        return jsonify({
            "error":
                "No document found with the provided id",
            "status":
                False
        }), 404

    return jsonify({
        "message":
            "Data updated successfully",
        "status":
            True
    }), 200


# =========================================================
# REGISTER VOLUNTEER
# =========================================================

@app.route(
    "/api/volunteers/register-volunteer",
    methods=["POST"]
)
def register_volunteer():

    db = get_db(
        request.tenant_id
    )

    user_data = request.get_json(
        silent=True
    ) or {}

    if not user_data:

        return jsonify({
            "error":
                "User data is required",
            "status":
                False
        }), 400

    existing_user = db.volunteers.find_one({
        "mobile":
            user_data.get(
                "mobile"
            )
    })

    if (
        existing_user
        and existing_user.get(
            "status"
        )
        in [
            "active",
            "pending"
        ]
    ):

        return jsonify({
            "error":
                "Mobile number already registered",
            "status":
                False
        }), 409

    try:

        user_data["role"] = (
            "Volunteer"
        )

        user_data["password"] = (
            generate_password_hash(
                "12345"
            )
        )

        user_data["status"] = (
            "pending"
        )

        user_data["created_at"] = (
            datetime.now()
        )

        result = db.volunteers.insert_one(
            user_data
        )

        return jsonify({
            "message":
                "User created successfully",

            "user_id":
                str(
                    result.inserted_id
                ),

            "status":
                True
        }), 201

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# DELETE VOLUNTEER
# =========================================================

@app.route(
    "/api/volunteers/delete-volunteer/<id>",
    methods=["DELETE"]
)
@token_required
def delete_volunteer(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    result = db.volunteers.update_one(
        {
            "_id":
                ObjectId(id)
        },
        {
            "$set": {
                "status":
                    "rejected",

                "deleted_by":
                    current_user["_id"],

                "deleted_at":
                    datetime.now()
            }
        }
    )

    if result.matched_count == 0:

        return jsonify({
            "error":
                "No document found with the provided id",
            "status":
                False
        }), 404

    return jsonify({
        "message":
            "Data deleted successfully",
        "status":
            True
    }), 200


# =========================================================
# CREATE EVENT
# =========================================================

@app.route(
    "/api/events/create-event",
    methods=["POST"]
)
@token_required
def create_event(
    current_user
):

    db = get_db(
        request.tenant_id
    )

    event_data = request.get_json(
        silent=True
    ) or {}

    if not event_data:

        return jsonify({
            "error":
                "Event data is required",
            "status":
                False
        }), 400

    try:

        event_data["created_by"] = (
            current_user["_id"]
        )

        event_data["created_at"] = (
            datetime.now()
        )

        result = db.events.insert_one(
            event_data
        )

        return jsonify({
            "message":
                "Event created successfully",

            "event_id":
                str(
                    result.inserted_id
                ),

            "status":
                True
        }), 201

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# UPDATE EVENT
# =========================================================

@app.route(
    "/api/events/update-event/<id>",
    methods=["PUT"]
)
@token_required
def update_event(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    event_data = request.get_json(
        silent=True
    ) or {}

    if not event_data:

        return jsonify({
            "error":
                "No data provided",
            "status":
                False
        }), 400

    images_to_delete = event_data.pop(
        "imageTobeDeleted",
        []
    )

    if not isinstance(
        images_to_delete,
        list
    ):

        images_to_delete = [
            images_to_delete
        ]

    errors = []

    for image_url in images_to_delete:

        try:

            delete_media_url(
                image_url
            )

        except Exception as e:

            errors.append(
                f"Failed to delete {image_url}: {str(e)}"
            )

    try:

        event_data["modified_by"] = (
            current_user["_id"]
        )

        event_data["modified_at"] = (
            datetime.now()
        )

        result = db.events.update_one(
            {
                "_id":
                    ObjectId(id)
            },
            {
                "$set":
                    event_data
            }
        )

        if result.matched_count == 0:

            return jsonify({
                "error":
                    "No document found with the provided id",
                "status":
                    False
            }), 404

        response = {
            "message":
                "Event updated successfully",

            "status":
                True
        }

        if errors:

            response["warnings"] = (
                errors
            )

        return jsonify(
            response
        ), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# DELETE EVENT
# =========================================================

@app.route(
    "/api/events/delete-event/<id>",
    methods=["DELETE"]
)
@token_required
def delete_event(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    try:

        event = db.events.find_one({
            "_id":
                ObjectId(id)
        })

        if not event:

            return jsonify({
                "error":
                    "No document found with the provided ID",
                "status":
                    False
            }), 404

        event_images_id = (
            event.get(
                "eventImagesId"
            )
        )

        if event_images_id:

            delete_media_prefix(
                f"events/{event_images_id}"
            )

        result = db.events.delete_one({
            "_id":
                ObjectId(id)
        })

        if result.deleted_count == 0:

            return jsonify({
                "error":
                    "No document found with the provided id",
                "status":
                    False
            }), 404

        return jsonify({
            "message":
                "Event deleted successfully",

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GET EVENTS
# =========================================================

@app.route(
    "/api/events/get-events",
    methods=["GET"]
)
def get_events():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.events.find()
        )

        results = []

        for doc in documents:

            results.append({

                "id":
                    str(
                        doc["_id"]
                    ),

                "_id":
                    str(
                        doc["_id"]
                    ),

                "name":
                    doc.get(
                        "name",
                        ""
                    ),

                "title":
                    doc.get(
                        "title",
                        ""
                    ),

                "start":
                    doc.get(
                        "start",
                        ""
                    ),

                "end":
                    doc.get(
                        "end",
                        ""
                    ),

                "address":
                    doc.get(
                        "address",
                        ""
                    ),

                "description":
                    doc.get(
                        "description",
                        ""
                    ),

                "images": [
                    convert_media_url_to_cloudinary(
                        image
                    )
                    for image in doc.get(
                        "images",
                        []
                    )
                ],

                "eventImagesId":
                    doc.get(
                        "eventImagesId",
                        ""
                    )
            })

        return jsonify({
            "events":
                results,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GET EVENT BY ID
# =========================================================

@app.route(
    "/api/events/get-event/<event_id>",
    methods=["GET"]
)
def get_event_by_id(
    event_id
):

    db = get_db(
        request.tenant_id
    )

    try:

        event = db.events.find_one({
            "_id":
                ObjectId(event_id)
        })

        if not event:

            return jsonify({
                "error":
                    "Event not found",
                "status":
                    False
            }), 404

        event["id"] = str(
            event["_id"]
        )

        event["_id"] = str(
            event["_id"]
        )

        if event.get(
            "created_by"
        ):

            event["created_by"] = str(
                event["created_by"]
            )

        if event.get(
            "created_at"
        ):

            event["created_at"] = str(
                event["created_at"]
            )

        event["modified_by"] = str(
            event.get(
                "modified_by",
                ""
            )
        )

        if event.get(
            "images"
        ):

            event["images"] = [
                convert_media_url_to_cloudinary(
                    image
                )
                for image in event["images"]
            ]

        return jsonify({
            "event":
                event,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GENERATE PRESIGNED URL
# =========================================================

@app.route(
    "/api/generate-presigned-url",
    methods=["POST"]
)
def generate_presigned_url():

    data = request.get_json(
        silent=True
    ) or {}

    file_name = data.get(
        "key"
    )

    if not file_name:

        return jsonify({
            "error":
                "File key is required",
            "status":
                False
        }), 400

    try:

        # -------------------------------------------------
        # AWS
        # -------------------------------------------------

        if AWS_ENABLED and s3_client:

            upload_url = (
                s3_client.generate_presigned_url(
                    ClientMethod="put_object",
                    Params={
                        "Bucket":
                            AWS_BUCKET_NAME,

                        "Key":
                            file_name
                    },
                    ExpiresIn=3600
                )
            )

            storage = "s3"

        # -------------------------------------------------
        # CLOUDINARY
        # -------------------------------------------------

        elif CLOUDINARY_ENABLED:

            safe_upload_path(
                file_name
            )

            encoded_file_name = quote(
                file_name,
                safe="/"
            )

            upload_url = (
                f"{request.host_url.rstrip('/')}"
                f"/api/local-files/"
                f"{encoded_file_name}"
            )

            storage = "cloudinary"

        # -------------------------------------------------
        # LOCAL
        # -------------------------------------------------

        else:

            safe_upload_path(
                file_name
            )

            encoded_file_name = quote(
                file_name,
                safe="/"
            )

            upload_url = (
                f"{request.host_url.rstrip('/')}"
                f"/api/local-files/"
                f"{encoded_file_name}"
            )

            storage = "local"

        return jsonify({
            "url":
                upload_url,

            "file_name":
                file_name,

            "storage":
                storage,

            "status":
                True
        }), 200

    except Exception as e:

        import traceback

        traceback.print_exc()

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 400


# =========================================================
# PROJECT PDF NORMALIZER
# =========================================================

def normalize_project_pdfs(
    project_data
):

    pdfs = project_data.get(
        "pdfs",
        None
    )

    if pdfs is None:

        old_pdf = project_data.get(
            "pdf",
            ""
        )

        if old_pdf:

            pdfs = [
                old_pdf
            ]

        else:

            pdfs = []

    if not isinstance(
        pdfs,
        list
    ):

        raise ValueError(
            "pdfs must be an array"
        )

    cleaned_pdfs = []

    for pdf in pdfs:

        if not isinstance(
            pdf,
            str
        ):

            continue

        pdf = pdf.strip()

        if (
            pdf
            and pdf not in cleaned_pdfs
        ):

            cleaned_pdfs.append(
                pdf
            )

    if len(cleaned_pdfs) > 3:

        raise ValueError(
            "A project can have a maximum of 3 PDFs"
        )

    return cleaned_pdfs


# =========================================================
# CREATE PROJECT
# =========================================================

@app.route(
    "/api/projects/create-project",
    methods=["POST"]
)
@token_required
def create_project(
    current_user
):

    db = get_db(
        request.tenant_id
    )

    project_data = request.get_json(
        silent=True
    ) or {}

    if not project_data:

        return jsonify({
            "error":
                "Project data is required",
            "status":
                False
        }), 400

    try:

        project_pdfs = (
            normalize_project_pdfs(
                project_data
            )
        )

        project_data["pdfs"] = (
            project_pdfs
        )

        project_data["pdf"] = (
            project_pdfs[0]
            if project_pdfs
            else ""
        )

        # -------------------------------------------------
        # IMAGES
        # -------------------------------------------------

        if isinstance(
            project_data.get("images"),
            list
        ):

            project_data["images"] = [
                convert_media_url_to_cloudinary(
                    image
                )
                for image in project_data["images"]
            ]

        # -------------------------------------------------
        # PDFS
        # -------------------------------------------------

        project_data["pdfs"] = [
            convert_media_url_to_cloudinary(
                pdf
            )
            for pdf in project_data["pdfs"]
        ]

        project_data["pdf"] = (
            project_data["pdfs"][0]
            if project_data["pdfs"]
            else ""
        )

        project_data["created_by"] = (
            current_user["_id"]
        )

        project_data["created_at"] = (
            datetime.now()
        )

        result = db.projects.insert_one(
            project_data
        )

        return jsonify({

            "message":
                "Project created successfully",

            "project_id":
                str(
                    result.inserted_id
                ),

            "images":
                project_data.get(
                    "images",
                    []
                ),

            "pdfs":
                project_data["pdfs"],

            "status":
                True
        }), 201

    except ValueError as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 400

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# UPDATE PROJECT
# =========================================================

@app.route(
    "/api/projects/update-project/<id>",
    methods=["PUT"]
)
@token_required
def update_project(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    project_data = request.get_json(
        silent=True
    ) or {}

    if not project_data:

        return jsonify({
            "error":
                "No data provided",
            "status":
                False
        }), 400

    try:

        existing_project = (
            db.projects.find_one({
                "_id":
                    ObjectId(id)
            })
        )

        if not existing_project:

            return jsonify({
                "error":
                    "No document found with the provided id",
                "status":
                    False
            }), 404

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 400

    images_to_delete = (
        project_data.pop(
            "imageTobeDeleted",
            []
        )
    )

    if not isinstance(
        images_to_delete,
        list
    ):

        images_to_delete = [
            images_to_delete
        ]

    errors = []

    for image_url in images_to_delete:

        try:

            delete_media_url(
                image_url
            )

        except Exception as e:

            errors.append(
                f"Failed to delete {image_url}: {str(e)}"
            )

    try:

        existing_pdfs = (
            normalize_project_pdfs(
                existing_project
            )
        )

    except ValueError:

        existing_pdfs = []

    pdfs_to_delete = (
        project_data.pop(
            "pdfsToDelete",
            []
        )
    )

    if not isinstance(
        pdfs_to_delete,
        list
    ):

        pdfs_to_delete = [
            pdfs_to_delete
        ]

    old_pdf_to_delete = (
        project_data.pop(
            "pdfTobeDeleted",
            ""
        )
    )

    if old_pdf_to_delete:

        if old_pdf_to_delete not in pdfs_to_delete:

            pdfs_to_delete.append(
                old_pdf_to_delete
            )

    cleaned_delete_pdfs = []

    for pdf_url in pdfs_to_delete:

        if (
            isinstance(
                pdf_url,
                str
            )
            and pdf_url.strip()
            and pdf_url not in cleaned_delete_pdfs
        ):

            cleaned_delete_pdfs.append(
                pdf_url
            )

    for pdf_url in cleaned_delete_pdfs:

        try:

            delete_media_url(
                pdf_url
            )

        except Exception as e:

            errors.append(
                f"Failed to delete PDF: {str(e)}"
            )

    try:

        if "pdfs" in project_data:

            new_pdfs = (
                normalize_project_pdfs(
                    project_data
                )
            )

        else:

            new_pdfs = (
                existing_pdfs.copy()
            )

        new_pdfs = [
            pdf
            for pdf in new_pdfs
            if pdf not in cleaned_delete_pdfs
        ]

        if len(new_pdfs) > 3:

            return jsonify({
                "error":
                    "A project can have a maximum of 3 PDFs",
                "status":
                    False
            }), 400

        # -------------------------------------------------
        # IMAGES
        # -------------------------------------------------

        if isinstance(
            project_data.get("images"),
            list
        ):

            project_data["images"] = [
                convert_media_url_to_cloudinary(
                    image
                )
                for image in project_data["images"]
            ]

        # -------------------------------------------------
        # PDFS
        # -------------------------------------------------

        new_pdfs = [
            convert_media_url_to_cloudinary(
                pdf
            )
            for pdf in new_pdfs
        ]

        project_data["pdfs"] = (
            new_pdfs
        )

        project_data["pdf"] = (
            new_pdfs[0]
            if new_pdfs
            else ""
        )

    except ValueError as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 400

    try:

        project_data["modified_by"] = (
            current_user["_id"]
        )

        project_data["modified_at"] = (
            datetime.now()
        )

        result = db.projects.update_one(
            {
                "_id":
                    ObjectId(id)
            },
            {
                "$set":
                    project_data
            }
        )

        if result.matched_count == 0:

            return jsonify({
                "error":
                    "No document found with the provided id",
                "status":
                    False
            }), 404

        response = {

            "message":
                "project updated successfully",

            "images":
                project_data.get(
                    "images",
                    []
                ),

            "pdfs":
                project_data["pdfs"],

            "status":
                True
        }

        if errors:

            response["warnings"] = (
                errors
            )

        return jsonify(
            response
        ), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# DELETE PROJECT
# =========================================================

@app.route(
    "/api/projects/delete-project/<id>",
    methods=["DELETE"]
)
@token_required
def delete_project(
    current_user,
    id
):

    db = get_db(
        request.tenant_id
    )

    try:

        project = db.projects.find_one({
            "_id":
                ObjectId(id)
        })

        if not project:

            return jsonify({
                "error":
                    "No document found with the provided ID",
                "status":
                    False
            }), 404

        project_images_id = (
            project.get(
                "projectImagesId"
            )
        )

        if project_images_id:

            delete_media_prefix(
                f"projects/{project_images_id}"
            )

        result = db.projects.delete_one({
            "_id":
                ObjectId(id)
        })

        if result.deleted_count == 0:

            return jsonify({
                "error":
                    "No document found with the provided id",
                "status":
                    False
            }), 404

        return jsonify({
            "message":
                "project deleted successfully",

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GET PROJECTS
# =========================================================

@app.route(
    "/api/projects/get-projects",
    methods=["GET"]
)
def get_projects():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.projects.find()
        )

        results = []

        for doc in documents:

            try:

                project_pdfs = (
                    normalize_project_pdfs(
                        doc
                    )
                )

            except ValueError:

                project_pdfs = []

            # -------------------------------------------------
            # IMAGES
            # -------------------------------------------------

            project_images = [
                convert_media_url_to_cloudinary(
                    image
                )
                for image in doc.get(
                    "images",
                    []
                )
            ]

            # -------------------------------------------------
            # PDFS
            # -------------------------------------------------

            project_pdfs = [
                convert_media_url_to_cloudinary(
                    pdf
                )
                for pdf in project_pdfs
            ]

            results.append({

                "id":
                    str(
                        doc["_id"]
                    ),

                "_id":
                    str(
                        doc["_id"]
                    ),

                "name":
                    doc.get(
                        "name",
                        ""
                    ),

                "title":
                    doc.get(
                        "title",
                        ""
                    ),

                "start":
                    doc.get(
                        "start",
                        ""
                    ),

                "end":
                    doc.get(
                        "end",
                        ""
                    ),

                "address":
                    doc.get(
                        "address",
                        ""
                    ),

                "description":
                    doc.get(
                        "description",
                        ""
                    ),

                "images":
                    project_images,

                "projectImagesId":
                    doc.get(
                        "projectImagesId",
                        ""
                    ),

                "pdfs":
                    project_pdfs,

                "pdf":
                    project_pdfs[0]
                    if project_pdfs
                    else ""
            })

        return jsonify({
            "projects":
                results,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# GET PROJECT BY ID
# =========================================================

@app.route(
    "/api/projects/get-project/<project_id>",
    methods=["GET"]
)
def get_project_by_id(
    project_id
):

    db = get_db(
        request.tenant_id
    )

    try:

        project = db.projects.find_one({
            "_id":
                ObjectId(project_id)
        })

        if not project:

            return jsonify({
                "error":
                    "project not found",
                "status":
                    False
            }), 404

        project["id"] = str(
            project["_id"]
        )

        project["_id"] = str(
            project["_id"]
        )

        if project.get(
            "created_by"
        ):

            project["created_by"] = str(
                project["created_by"]
            )

        if project.get(
            "created_at"
        ):

            project["created_at"] = str(
                project["created_at"]
            )

        project["modified_by"] = str(
            project.get(
                "modified_by",
                ""
            )
        )

        if project.get(
            "modified_at"
        ):

            project["modified_at"] = str(
                project["modified_at"]
            )

        # -------------------------------------------------
        # IMAGES
        # -------------------------------------------------

        project["images"] = [
            convert_media_url_to_cloudinary(
                image
            )
            for image in project.get(
                "images",
                []
            )
        ]

        # -------------------------------------------------
        # PDFS
        # -------------------------------------------------

        try:

            project_pdfs = (
                normalize_project_pdfs(
                    project
                )
            )

        except ValueError:

            project_pdfs = []

        project_pdfs = [
            convert_media_url_to_cloudinary(
                pdf
            )
            for pdf in project_pdfs
        ]

        project["pdfs"] = (
            project_pdfs
        )

        project["pdf"] = (
            project_pdfs[0]
            if project_pdfs
            else ""
        )

        return jsonify({
            "project":
                project,

            "status":
                True
        }), 200

    except Exception as e:

        return jsonify({
            "error":
                str(e),
            "status":
                False
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    host = os.getenv(
        "HOST",
        "127.0.0.1"
    )

    port = int(
        os.getenv(
            "PORT",
            "5001"
        )
    )

    debug = os.getenv(
        "FLASK_DEBUG",
        "true"
    ).lower() in {
        "1",
        "true",
        "yes"
    }

    print("=" * 60)

    print(
        "NGO BACKEND STARTING"
    )

    print(
        "Cloudinary enabled:",
        CLOUDINARY_ENABLED
    )

    print(
        "MongoDB configured:",
        bool(
            os.getenv(
                "MONGODB_URI",
                ""
            ).strip()
        )
    )

    print("=" * 60)

    app.run(
        host=host,
        port=port,
        debug=debug
    )