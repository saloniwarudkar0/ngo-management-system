from flask import Flask, request, g, jsonify, send_from_directory
import jwt
import datetime
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


# =========================================================
# BASE CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = Path(
    os.getenv(
        'LOCAL_UPLOAD_DIR',
        BASE_DIR / 'uploads'
    )
).resolve()

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


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
    'SECRET_KEY',
    'local-development-secret-change-before-production'
)

AWS_ENABLED = os.getenv(
    'AWS_ENABLED',
    'false'
).lower() in {
    '1',
    'true',
    'yes'
}

AWS_BUCKET_NAME = os.getenv(
    'AWS_BUCKET_NAME',
    'jaljivnam'
)

AWS_REGION = os.getenv(
    'AWS_REGION',
    'ap-south-1'
)


# =========================================================
# AWS / S3
# =========================================================

s3_client = None

if AWS_ENABLED:
    import boto3

    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION
    )


# =========================================================
# TENANT CONFIGURATION
# =========================================================

tenants_config_path = Path(
    os.getenv(
        'TENANTS_CONFIG_PATH',
        BASE_DIR / 'tenants_config.json'
    )
).expanduser().resolve()


with tenants_config_path.open() as f:
    tenants_config = json.load(f)


# =========================================================
# DATABASE
# =========================================================

def get_db(tenant_id):
    """
    Get a database connection for a given tenant.
    """

    tenant_config = tenants_config.get(tenant_id)

    if not tenant_config:
        raise ValueError("Invalid tenant ID")

    connection_uri = tenant_config['connection_uri']
    db_name = tenant_config['db_name']

    if 'db' not in g:

        client = MongoClient(
            connection_uri,
            serverSelectionTimeoutMS=3000
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
                'scrypt:',
                'pbkdf2:'
            )
        )
    )


def password_matches(
    stored_password,
    submitted_password
):

    if not stored_password or not submitted_password:
        return False

    if is_password_hash(stored_password):

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

    if request.method == 'OPTIONS':
        return

    if request.endpoint in {
        'health',
        'serve_local_file',
        'upload_local_file'
    }:
        return

    app.logger.debug(
        "Headers: %s",
        request.method
    )

    tenant_id = request.headers.get(
        'x-tenant-id'
    )

    if not tenant_id:

        return jsonify({
            "error": "Tenant ID is required",
            "status": False
        }), 400

    if tenant_id not in tenants_config:

        return jsonify({
            "error": "Invalid tenant ID",
            "status": False
        }), 400

    request.tenant_id = tenant_id


# =========================================================
# CLOSE DATABASE CONNECTION
# =========================================================

@app.teardown_appcontext
def close_connection(exception):

    db = g.pop(
        'db',
        None
    )

    if db is not None:

        db.client.close()


# =========================================================
# HEALTH
# =========================================================

@app.route(
    '/api/health',
    methods=['GET']
)
def health():

    tenant_id = request.headers.get(
        'x-tenant-id',
        'localhost'
    )

    if tenant_id not in tenants_config:

        return jsonify({
            "error": "Invalid tenant ID",
            "status": False
        }), 400

    try:

        get_db(
            tenant_id
        ).command('ping')

    except Exception as error:

        return jsonify({
            "service": "ngo-backend",
            "database": "unavailable",
            "error": str(error),
            "status": False,
        }), 503

    return jsonify({
        "service": "ngo-backend",
        "database": "connected",
        "storage": "s3" if AWS_ENABLED else "local",
        "status": True,
    }), 200


# =========================================================
# SAFE UPLOAD PATH
# =========================================================

def safe_upload_path(key):

    normalized_key = unquote(
        key
    ).replace(
        '\\',
        '/'
    )

    relative_path = PurePosixPath(
        normalized_key
    )

    if (
        relative_path.is_absolute()
        or '..' in relative_path.parts
    ):

        raise ValueError(
            'Invalid upload path'
        )

    target = UPLOAD_DIR.joinpath(
        *relative_path.parts
    ).resolve()

    if (
        target != UPLOAD_DIR
        and UPLOAD_DIR not in target.parents
    ):

        raise ValueError(
            'Invalid upload path'
        )

    return target


# =========================================================
# LOCAL FILE UPLOAD
# =========================================================

@app.route(
    '/api/local-files/<path:key>',
    methods=['PUT']
)
def upload_local_file(key):

    try:

        target = safe_upload_path(
            key
        )

        target.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        target.write_bytes(
            request.get_data()
        )

        return '', 200

    except ValueError as error:

        return jsonify({
            "error": str(error),
            "status": False
        }), 400


# =========================================================
# LOCAL FILE SERVE
# =========================================================

@app.route(
    '/api/local-files/<path:key>',
    methods=['GET']
)
def serve_local_file(key):

    return send_from_directory(
        UPLOAD_DIR,
        key
    )


# =========================================================
# DELETE MEDIA URL
# =========================================================

def delete_media_url(image_url):

    if not image_url:
        return

    parsed_url = urlparse(
        image_url
    )

    local_marker = '/api/local-files/'

    # -------------------------
    # LOCAL STORAGE
    # -------------------------

    if local_marker in parsed_url.path:

        local_key = parsed_url.path.split(
            local_marker,
            1
        )[1]

        target = safe_upload_path(
            local_key
        )

        target.unlink(
            missing_ok=True
        )

        return

    # -------------------------
    # AWS S3
    # -------------------------

    if AWS_ENABLED and s3_client:

        s3_prefix = (
            f"{AWS_BUCKET_NAME}.s3.amazonaws.com/"
        )

        object_key = image_url.split(
            s3_prefix
        )[-1]

        s3_client.delete_object(
            Bucket=AWS_BUCKET_NAME,
            Key=object_key
        )

        return

    raise RuntimeError(
        'Remote media deletion is unavailable '
        'while AWS is disabled'
    )


# =========================================================
# DELETE MEDIA PREFIX
# =========================================================

def delete_media_prefix(prefix):

    # -------------------------
    # AWS S3
    # -------------------------

    if AWS_ENABLED and s3_client:

        objects_to_delete = (
            s3_client.list_objects_v2(
                Bucket=AWS_BUCKET_NAME,
                Prefix=prefix
            )
        )

        if 'Contents' in objects_to_delete:

            keys = [
                {
                    'Key': item['Key']
                }
                for item in objects_to_delete['Contents']
            ]

            s3_client.delete_objects(
                Bucket=AWS_BUCKET_NAME,
                Delete={
                    'Objects': keys,
                    'Quiet': True
                }
            )

        return

    # -------------------------
    # LOCAL STORAGE
    # -------------------------

    target = safe_upload_path(
        prefix
    )

    if target.exists() and target.is_dir():

        shutil.rmtree(
            target
        )


# =========================================================
# TOKEN REQUIRED
# =========================================================

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        token = request.headers.get(
            'Authorization'
        )

        if not token:

            return jsonify({
                'message': 'Token is missing!',
                "status": False
            }), 401

        try:

            token = token.split(" ")[1]

            decoded = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            current_user = get_db(
                request.tenant_id
            ).volunteers.find_one({
                '_id': ObjectId(
                    decoded['sub']
                )
            })

            if not current_user:

                raise jwt.InvalidTokenError

        except jwt.ExpiredSignatureError:

            return jsonify({
                'message': 'Token has expired!',
                "status": False
            }), 401

        except jwt.InvalidTokenError:

            return jsonify({
                'message': 'Invalid token!',
                "status": False
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
    '/api/login',
    methods=['POST']
)
def login():

    db = get_db(
        request.tenant_id
    )

    username = request.json.get(
        'username'
    )

    password = request.json.get(
        'password'
    )

    if not username or not password:

        return jsonify({
            'error': 'Username and password are required',
            "status": False
        }), 400

    user = db.volunteers.find_one({
        'mobile': username
    })

    if (
        user
        and password_matches(
            user.get('password'),
            password
        )
        and user['role'] == 'Head-Volunteer'
    ):

        if not is_password_hash(
            user.get('password')
        ):

            db.volunteers.update_one(
                {
                    '_id': user['_id']
                },
                {
                    '$set': {
                        'password':
                            generate_password_hash(
                                password
                            )
                    }
                }
            )

        payload = {

            'exp':
                datetime.utcnow()
                + timedelta(days=1),

            'iat':
                datetime.utcnow(),

            'sub':
                str(user['_id'])
        }

        token = jwt.encode(
            payload,
            SECRET_KEY,
            algorithm='HS256'
        )

        return jsonify({

            'token': token,

            'role':
                user['role'],

            'status':
                True

        }), 200

    else:

        return jsonify({

            'error':
                'Invalid username or password',

            "status":
                False

        }), 401


# =========================================================
# VERIFY TOKEN
# =========================================================

@app.route(
    '/api/verify-token',
    methods=['GET']
)
@token_required
def verify_token(current_user):

    user_info = {

        'username':
            current_user.get('username'),

        'role':
            current_user.get('role'),

        'status':
            True
    }

    return jsonify(
        user_info
    ), 200


# =========================================================
# CREATE VOLUNTEER
# =========================================================

@app.route(
    '/api/volunteers/create-volunteer',
    methods=['POST']
)
@token_required
def create_volunteer(current_user):

    db = get_db(
        request.tenant_id
    )

    user_data = request.json

    print(
        "here is the userData",
        user_data
    )

    if not user_data:

        return jsonify({
            "error": "User data is required",
            "status": False
        }), 400

    try:

        if user_data.get('password'):

            user_data['password'] = (
                generate_password_hash(
                    user_data['password']
                )
            )

        user_data['created_by'] = (
            current_user['_id']
        )

        user_data['created_at'] = (
            datetime.now()
        )

        result = db.volunteers.insert_one(
            user_data
        )

        return jsonify({

            "message":
                "User created successfully",

            "user_id":
                str(result.inserted_id),

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
    '/api/volunteers/update-volunteer/<id>',
    methods=['PUT']
)
@token_required
def update_volunteer(current_user, id):

    db = get_db(
        request.tenant_id
    )

    data = request.json

    if not data:

        return jsonify({
            "error": "No data provided",
            "status": False
        }), 400

    if data.get('password'):

        data['password'] = (
            generate_password_hash(
                data['password']
            )
        )

    data['modified_by'] = (
        current_user['_id']
    )

    data['modified_at'] = (
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
    '/api/volunteers/get-volunteers',
    methods=['GET']
)
def get_volunteers():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.volunteers.find({
                'status':
                    'active'
            })
        )

        results = []

        for doc in documents:

            k = {}

            k['_id'] = str(
                doc['_id']
            )

            k['id'] = str(
                doc['_id']
            )

            k['name'] = doc['name']

            k['status'] = doc['status']

            k['role'] = doc['role']

            k['mobile'] = doc['mobile']

            k['address'] = doc['address']

            results.append(k)

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
    '/api/volunteers/get-volunteer-requests',
    methods=['GET']
)
def get_volunteer_requests():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.volunteers.find({
                'status':
                    'pending'
            })
        )

        results = []

        for doc in documents:

            doc['_id'] = str(
                doc['_id']
            )

            doc['id'] = str(
                doc['_id']
            )

            doc.pop(
                'password',
                None
            )

            results.append(doc)

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
    '/api/volunteers/authorize/<id>',
    methods=['PUT']
)
@token_required
def authorize_volunteer(current_user, id):

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

                'status':
                    'active',

                'authorized_by':
                    current_user['_id'],

                'authorized_at':
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
    '/api/volunteers/register-volunteer',
    methods=['POST']
)
def register_volunteer():

    db = get_db(
        request.tenant_id
    )

    user_data = request.json

    print(
        "here is the userData",
        user_data
    )

    if not user_data:

        return jsonify({

            "error":
                "User data is required",

            "status":
                False

        }), 400

    existing_user = db.volunteers.find_one({

        "mobile":
            user_data.get("mobile")
    })

    if (
        existing_user
        and existing_user.get("status")
        in ["active", "pending"]
    ):

        return jsonify({

            "error":
                "Mobile number already registered",

            "status":
                False

        }), 409

    try:

        user_data['role'] = 'Volunteer'

        user_data['password'] = (
            generate_password_hash(
                '12345'
            )
        )

        user_data['status'] = 'pending'

        user_data['created_at'] = (
            datetime.now()
        )

        result = db.volunteers.insert_one(
            user_data
        )

        return jsonify({

            "message":
                "User created successfully",

            "user_id":
                str(result.inserted_id),

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
    '/api/volunteers/delete-volunteer/<id>',
    methods=['DELETE']
)
@token_required
def delete_volunteer(current_user, id):

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

                'status':
                    'rejected',

                'deleted_by':
                    current_user['_id'],

                'deleted_at':
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
    '/api/events/create-event',
    methods=['POST']
)
@token_required
def create_event(current_user):

    db = get_db(
        request.tenant_id
    )

    event_data = request.json

    print(
        "event data, ",
        event_data
    )

    if not event_data:

        return jsonify({

            "error":
                "Event data is required",

            "status":
                False

        }), 400

    try:

        event_data['created_by'] = (
            current_user['_id']
        )

        event_data['created_at'] = (
            datetime.now()
        )

        result = db.events.insert_one(
            event_data
        )

        return jsonify({

            "message":
                "Event created successfully",

            "event_id":
                str(result.inserted_id),

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
    '/api/events/update-event/<id>',
    methods=['PUT']
)
@token_required
def update_event(current_user, id):

    db = get_db(
        request.tenant_id
    )

    event_data = request.json

    if not event_data:

        return jsonify({

            "error":
                "No data provided",

            "status":
                False

        }), 400

    images_to_delete = event_data.pop(
        'imageTobeDeleted',
        []
    )

    errors = []

    for image_url in images_to_delete:

        try:

            delete_media_url(
                image_url
            )

        except Exception as e:

            print(
                f"Error deleting image {image_url}: {e}"
            )

            errors.append(
                f"Failed to delete {image_url}: {str(e)}"
            )

    try:

        event_data['modified_by'] = (
            current_user['_id']
        )

        event_data['modified_at'] = (
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

            response["warnings"] = errors

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
    '/api/events/delete-event/<id>',
    methods=['DELETE']
)
@token_required
def delete_event(current_user, id):

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

        event_images_id = event.get(
            'eventImagesId'
        )

        if event_images_id:

            prefix = (
                f"events/{event_images_id}"
            )

            delete_media_prefix(
                prefix
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
    '/api/events/get-events',
    methods=['GET']
)
def get_events():

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.events.find()
        )

        print(
            "got all events here ",
            documents
        )

        results = []

        for doc in documents:

            k = {}

            k['id'] = str(
                doc['_id']
            )

            k['_id'] = str(
                doc['_id']
            )

            k['name'] = doc['name']

            k['title'] = doc['title']

            k['start'] = doc['start']

            k['end'] = doc['end']

            k['address'] = doc['address']

            k['description'] = doc['description']

            k['images'] = doc['images']

            k['eventImagesId'] = (
                doc['eventImagesId']
            )

            results.append(k)

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
    '/api/events/get-event/<event_id>',
    methods=['GET']
)
def get_event_by_id(event_id):

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

        event['id'] = str(
            event['_id']
        )

        event['_id'] = str(
            event['_id']
        )

        event['created_by'] = str(
            event['created_by']
        )

        event['created_at'] = str(
            event['created_at']
        )

        event['modified_by'] = str(
            event.get(
                'modified_by',
                ''
            )
        )

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
    '/api/generate-presigned-url',
    methods=['POST']
)
def generate_presigned_url():

    file_name = request.json['key']

    try:

        # -------------------------
        # AWS S3
        # -------------------------

        if AWS_ENABLED and s3_client:

            upload_url = (
                s3_client.generate_presigned_url(
                    ClientMethod='put_object',

                    Params={
                        'Bucket':
                            AWS_BUCKET_NAME,

                        'Key':
                            file_name
                    },

                    ExpiresIn=3600
                )
            )

            storage = 's3'

        # -------------------------
        # LOCAL STORAGE
        # -------------------------

        else:

            safe_upload_path(
                file_name
            )

            encoded_file_name = quote(
                file_name,
                safe='/'
            )

            upload_url = (
                f"{request.host_url.rstrip('/')}"
                f"/api/local-files/"
                f"{encoded_file_name}"
            )

            storage = 'local'

        return jsonify({

            'url':
                upload_url,

            'file_name':
                file_name,

            'storage':
                storage,

            'status':
                True

        })

    except Exception as e:

        return jsonify({

            'error':
                str(e),

            'status':
                False

        }), 400


# =========================================================
# PROJECT APIs
# =========================================================


# =========================================================
# PROJECT PDF NORMALIZER
# =========================================================

def normalize_project_pdfs(project_data):

    """
    Convert old single PDF format into the new
    multiple PDF format.

    Old:
        pdf: "url"

    New:
        pdfs: ["url1", "url2", "url3"]

    Maximum 3 PDFs are allowed.
    """

    pdfs = project_data.get(
        'pdfs',
        None
    )

    # -----------------------------------------------------
    # BACKWARD COMPATIBILITY
    # -----------------------------------------------------

    if pdfs is None:

        old_pdf = project_data.get(
            'pdf',
            ''
        )

        if old_pdf:

            pdfs = [
                old_pdf
            ]

        else:

            pdfs = []

    # -----------------------------------------------------
    # VALIDATE ARRAY
    # -----------------------------------------------------

    if not isinstance(
        pdfs,
        list
    ):

        raise ValueError(
            'pdfs must be an array'
        )

    # -----------------------------------------------------
    # CLEAN VALUES
    # -----------------------------------------------------

    cleaned_pdfs = []

    for pdf in pdfs:

        if not isinstance(
            pdf,
            str
        ):

            continue

        pdf = pdf.strip()

        if not pdf:

            continue

        if pdf not in cleaned_pdfs:

            cleaned_pdfs.append(
                pdf
            )

    # -----------------------------------------------------
    # MAXIMUM 3
    # -----------------------------------------------------

    if len(cleaned_pdfs) > 3:

        raise ValueError(
            'A project can have a maximum of 3 PDFs'
        )

    return cleaned_pdfs


# =========================================================
# CREATE PROJECT
# =========================================================

@app.route(
    '/api/projects/create-project',
    methods=['POST']
)
@token_required
def create_project(current_user):

    """
    Create a new project.

    A project can contain maximum 3 PDFs.

    New format:

        pdfs: [
            "pdf-url-1",
            "pdf-url-2",
            "pdf-url-3"
        ]

    The old single `pdf` field is also supported
    for backward compatibility.
    """

    db = get_db(
        request.tenant_id
    )

    project_data = request.json

    print(
        "project data, ",
        project_data
    )

    if not project_data:

        return jsonify({

            "error":
                "Project data is required",

            "status":
                False

        }), 400

    try:

        # =================================================
        # NORMALIZE PDFs
        # =================================================

        project_pdfs = normalize_project_pdfs(
            project_data
        )

        project_data['pdfs'] = (
            project_pdfs
        )

        # Keep old field for backward compatibility.
        # It contains the first PDF only.
        project_data['pdf'] = (
            project_pdfs[0]
            if project_pdfs
            else ''
        )

        # =================================================
        # CREATED INFORMATION
        # =================================================

        project_data['created_by'] = (
            current_user['_id']
        )

        project_data['created_at'] = (
            datetime.now()
        )

        # =================================================
        # INSERT
        # =================================================

        result = db.projects.insert_one(
            project_data
        )

        return jsonify({

            "message":
                "Project created successfully",

            "project_id":
                str(result.inserted_id),

            "pdfs":
                project_pdfs,

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
    '/api/projects/update-project/<id>',
    methods=['PUT']
)
@token_required
def update_project(current_user, id):

    """
    Update an existing project.

    Supports:

    - image deletion
    - multiple PDF deletion
    - adding PDFs
    - replacing PDFs
    - maximum 3 PDFs

    New PDF delete format:

        pdfsToDelete: [
            "old-pdf-url-1",
            "old-pdf-url-2"
        ]

    Old format is also supported:

        pdfTobeDeleted: "old-pdf-url"
    """

    db = get_db(
        request.tenant_id
    )

    project_data = request.json

    if not project_data:

        return jsonify({

            "error":
                "No data provided",

            "status":
                False

        }), 400

    # =====================================================
    # FIND EXISTING PROJECT
    # =====================================================

    try:

        existing_project = db.projects.find_one({

            "_id":
                ObjectId(id)
        })

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

    # =====================================================
    # DELETE SELECTED IMAGES
    # =====================================================

    images_to_delete = project_data.pop(
        'imageTobeDeleted',
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

            print(
                f"Error deleting image {image_url}: {e}"
            )

            errors.append(
                f"Failed to delete {image_url}: {str(e)}"
            )

    # =====================================================
    # GET EXISTING PDFS
    # =====================================================

    try:

        existing_pdfs = normalize_project_pdfs(
            existing_project
        )

    except ValueError:

        existing_pdfs = []

    # =====================================================
    # PDFS TO DELETE
    # =====================================================

    pdfs_to_delete = project_data.pop(
        'pdfsToDelete',
        []
    )

    if not isinstance(
        pdfs_to_delete,
        list
    ):

        pdfs_to_delete = [
            pdfs_to_delete
        ]

    # -----------------------------------------------------
    # OLD SINGLE PDF DELETE FIELD
    # -----------------------------------------------------

    old_pdf_to_delete = project_data.pop(
        'pdfTobeDeleted',
        ''
    )

    if old_pdf_to_delete:

        if old_pdf_to_delete not in pdfs_to_delete:

            pdfs_to_delete.append(
                old_pdf_to_delete
            )

    # =====================================================
    # CLEAN PDF DELETE LIST
    # =====================================================

    cleaned_delete_pdfs = []

    for pdf_url in pdfs_to_delete:

        if (
            isinstance(pdf_url, str)
            and pdf_url.strip()
            and pdf_url not in cleaned_delete_pdfs
        ):

            cleaned_delete_pdfs.append(
                pdf_url
            )

    # =====================================================
    # DELETE PDF FILES FROM STORAGE
    # =====================================================

    for pdf_url in cleaned_delete_pdfs:

        try:

            delete_media_url(
                pdf_url
            )

        except Exception as e:

            print(
                f"Error deleting PDF {pdf_url}: {e}"
            )

            errors.append(
                f"Failed to delete PDF: {str(e)}"
            )

    # =====================================================
    # HANDLE NEW PDF ARRAY
    # =====================================================

    try:

        if 'pdfs' in project_data:

            new_pdfs = normalize_project_pdfs(
                project_data
            )

        else:

            # -------------------------------------------------
            # If frontend does not send pdfs,
            # keep existing PDFs.
            # -------------------------------------------------

            new_pdfs = existing_pdfs.copy()

        # -------------------------------------------------
        # Remove PDFs explicitly deleted by user.
        # -------------------------------------------------

        new_pdfs = [
            pdf
            for pdf in new_pdfs
            if pdf not in cleaned_delete_pdfs
        ]

        # -------------------------------------------------
        # Maximum 3 PDFs
        # -------------------------------------------------

        if len(new_pdfs) > 3:

            return jsonify({

                "error":
                    "A project can have a maximum of 3 PDFs",

                "status":
                    False

            }), 400

        project_data['pdfs'] = (
            new_pdfs
        )

        # -------------------------------------------------
        # Keep old field for backward compatibility
        # -------------------------------------------------

        project_data['pdf'] = (
            new_pdfs[0]
            if new_pdfs
            else ''
        )

    except ValueError as e:

        return jsonify({

            "error":
                str(e),

            "status":
                False

        }), 400

    # =====================================================
    # UPDATE INFORMATION
    # =====================================================

    try:

        project_data['modified_by'] = (
            current_user['_id']
        )

        project_data['modified_at'] = (
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

            "pdfs":
                project_data['pdfs'],

            "status":
                True
        }

        if errors:

            response["warnings"] = errors

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
    '/api/projects/delete-project/<id>',
    methods=['DELETE']
)
@token_required
def delete_project(current_user, id):

    """
    Delete an existing project.

    This also deletes all files inside:

        projects/{projectImagesId}/

    This includes:

        - project images
        - project PDFs
    """

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

        project_images_id = project.get(
            'projectImagesId'
        )

        if project_images_id:

            prefix = (
                f"projects/{project_images_id}"
            )

            delete_media_prefix(
                prefix
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
# GET ALL PROJECTS
# =========================================================

@app.route(
    '/api/projects/get-projects',
    methods=['GET']
)
def get_projects():

    """
    Retrieve all projects.

    Every project returns:

        pdfs: []

    Maximum 3 PDF URLs.

    Old projects containing only `pdf`
    are automatically converted to an array.
    """

    db = get_db(
        request.tenant_id
    )

    try:

        documents = list(
            db.projects.find()
        )

        print(
            "got all projects here ",
            documents
        )

        results = []

        for doc in documents:

            k = {}

            k['id'] = str(
                doc['_id']
            )

            k['_id'] = str(
                doc['_id']
            )

            k['name'] = doc.get(
                'name',
                ''
            )

            k['title'] = doc.get(
                'title',
                ''
            )

            k['start'] = doc.get(
                'start',
                ''
            )

            k['end'] = doc.get(
                'end',
                ''
            )

            k['address'] = doc.get(
                'address',
                ''
            )

            k['description'] = doc.get(
                'description',
                ''
            )

            k['images'] = doc.get(
                'images',
                []
            )

            k['projectImagesId'] = doc.get(
                'projectImagesId',
                ''
            )

            # =================================================
            # MULTIPLE PDFs
            # =================================================

            try:

                project_pdfs = normalize_project_pdfs(
                    doc
                )

            except ValueError:

                project_pdfs = []

            k['pdfs'] = (
                project_pdfs
            )

            # -------------------------------------------------
            # Backward compatibility
            # -------------------------------------------------

            k['pdf'] = (
                project_pdfs[0]
                if project_pdfs
                else ''
            )

            results.append(k)

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
    '/api/projects/get-project/<project_id>',
    methods=['GET']
)
def get_project_by_id(project_id):

    """
    Retrieve a single project.

    Returns:

        pdfs: [
            "url1",
            "url2",
            "url3"
        ]

    Old projects with a single `pdf`
    are automatically converted to `pdfs`.
    """

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

        # =================================================
        # CONVERT OBJECT IDS / DATES TO STRING
        # =================================================

        project['id'] = str(
            project['_id']
        )

        project['_id'] = str(
            project['_id']
        )

        if project.get('created_by'):

            project['created_by'] = str(
                project['created_by']
            )

        if project.get('created_at'):

            project['created_at'] = str(
                project['created_at']
            )

        project['modified_by'] = str(
            project.get(
                'modified_by',
                ''
            )
        )

        if project.get('modified_at'):

            project['modified_at'] = str(
                project['modified_at']
            )

        # =================================================
        # MULTIPLE PDFs
        # =================================================

        try:

            project_pdfs = normalize_project_pdfs(
                project
            )

        except ValueError:

            project_pdfs = []

        project['pdfs'] = (
            project_pdfs
        )

        # -------------------------------------------------
        # Backward compatibility
        # -------------------------------------------------

        project['pdf'] = (
            project_pdfs[0]
            if project_pdfs
            else ''
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
# APPLICATION START
# =========================================================

if __name__ == "__main__":

    host = os.getenv(
        'HOST',
        '127.0.0.1'
    )

    port = int(
        os.getenv(
            'PORT',
            '5001'
        )
    )

    debug = os.getenv(
        'FLASK_DEBUG',
        'true'
    ).lower() in {
        '1',
        'true',
        'yes'
    }

    app.run(
        host=host,
        port=port,
        debug=debug
    )


# =========================================================
# LOCAL TENANT CONFIG
# =========================================================

# "localhost": {
#     "connection_uri":
#         "mongodb://127.0.0.1:27017",
#
#     "db_name":
#         "localhost"
# }