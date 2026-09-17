import json
import os
from datetime import datetime, timezone
from pathlib import Path

from pymongo import MongoClient
from werkzeug.security import generate_password_hash


base_dir = Path(__file__).resolve().parent
config_path = Path(
    os.getenv('TENANTS_CONFIG_PATH', base_dir / 'tenants_config.json')
).expanduser().resolve()

with config_path.open() as config_file:
    tenant = json.load(config_file)['localhost']

mobile = os.getenv('LOCAL_ADMIN_MOBILE', '9999999999')
password = os.getenv('LOCAL_ADMIN_PASSWORD', 'local-admin-123')

client = MongoClient(tenant['connection_uri'], serverSelectionTimeoutMS=3000)
database = client[tenant['db_name']]
database.command('ping')
database.volunteers.update_one(
    {'mobile': mobile},
    {
        '$set': {
            'name': 'Local Administrator',
            'mobile': mobile,
            'password': generate_password_hash(password),
            'role': 'Head-Volunteer',
            'status': 'active',
            'address': 'Local development',
            'updated_at': datetime.now(timezone.utc),
        },
        '$setOnInsert': {'created_at': datetime.now(timezone.utc)},
    },
    upsert=True,
)
client.close()

print(f"Local admin ready: {mobile} / {password}")
