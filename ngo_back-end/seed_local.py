import os
from datetime import datetime, timezone

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv


load_dotenv()

# Atlas connection
mongodb_uri = os.getenv("MONGODB_URI")

if not mongodb_uri:
    raise RuntimeError("MONGODB_URI is not set in .env")


# Existing admin credentials
mobile = os.getenv("LOCAL_ADMIN_MOBILE", "9999999999")
password = os.getenv("LOCAL_ADMIN_PASSWORD", "local-admin-123")


# Connect to MongoDB Atlas
client = MongoClient(
    mongodb_uri,
    serverSelectionTimeoutMS=5000
)

# Your Atlas database
database = client["localhost"]

# Check connection
database.command("ping")


# Create / update existing Head-Volunteer
database.volunteers.update_one(
    {"mobile": mobile},
    {
        "$set": {
            "name": "Local Administrator",
            "mobile": mobile,
            "password": generate_password_hash(password),
            "role": "Head-Volunteer",
            "status": "active",
            "address": "Local development",
            "updated_at": datetime.now(timezone.utc),
        },
        "$setOnInsert": {
            "created_at": datetime.now(timezone.utc)
        },
    },
    upsert=True,
)


client.close()

print("Atlas admin ready successfully!")
print(f"Mobile: {mobile}")
print("Password: local admin password configured in the script.")