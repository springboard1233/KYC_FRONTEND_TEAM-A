import os
import sys
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import Config

client = MongoClient(Config.MONGO_URI)
db = client.get_database()

# Create admin user
if db.users.find_one({"username": "admin"}) is None:
    admin_user = {
        "username": "admin",
        "password": generate_password_hash("admin123", method='pbkdf2:sha256'),
        "role": "admin",
        "status": "approved"
    }
    db.users.insert_one(admin_user)
    print("Admin user created successfully.")
else:
    print("Admin user already exists.")

client.close()