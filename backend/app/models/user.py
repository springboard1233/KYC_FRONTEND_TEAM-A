# FILE: backend/app/models/user.py
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId
from flask import current_app

# Note: The 'get_db' function is typically imported from a utils/database module.
# Assuming it's available in the application context as per the project structure.
from app.utils.database import get_db

class User:
    """
    Represents a user in the system.
    Handles all database interactions for the users collection.
    """
    def __init__(self, name, email, password=None, role="user", is_verified=False, _id=None, created_at=None, last_login=None, otp=None, otp_expires_at=None, password_hash=None):
        self._id = _id
        self.name = name
        self.email = email
        
        # REFACTOR: Standardize password handling.
        # If a plain-text password is provided, hash it.
        # If a hash is provided (e.g., from the DB), use it directly.
        if password and not password_hash:
            self.password_hash = generate_password_hash(password)
        else:
            self.password_hash = password_hash
            
        self.role = role
        self.is_verified = is_verified
        self.created_at = created_at or datetime.utcnow()
        self.last_login = last_login
        self.otp = otp
        self.otp_expires_at = otp_expires_at

    def check_password(self, password):
        """Verifies a given password against the stored hash."""
        # Ensure there is a hash to compare against to prevent errors
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def save(self):
        """Saves the user document to the database (inserts or updates)."""
        db = get_db()
        # REFACTOR: The database field is now 'password_hash' for clarity.
        user_data = {
            "name": self.name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "otp": self.otp,
            "otp_expires_at": self.otp_expires_at,
        }
        
        # Remove keys with None values to keep documents clean
        user_data = {k: v for k, v in user_data.items() if v is not None}
        
        if self._id:
            # Update existing user
            result = db.users.update_one(
                {"_id": self._id},
                {"$set": user_data}
            )
            return result.modified_count > 0
        else:
            # Create new user
            result = db.users.insert_one(user_data)
            self._id = result.inserted_id
            return True

    def update_last_login(self):
        """Updates the last_login timestamp and saves the user."""
        self.last_login = datetime.utcnow()
        db = get_db()
        db.users.update_one({"_id": self._id}, {"$set": {"last_login": self.last_login}})

    def to_dict(self):
        """Returns a dictionary representation of the user, safe for JSON serialization."""
        return {
            "id": str(self._id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

    @classmethod
    def find_by_email(cls, email):
        """Finds a user by their email address."""
        db = get_db()
        user_data = db.users.find_one({"email": email})
        if user_data:
            return cls.from_dict(user_data)
        return None

    @classmethod
    def find_by_id(cls, user_id):
        """Finds a user by their MongoDB ObjectId."""
        db = get_db()
        try:
            user_data = db.users.find_one({"_id": ObjectId(user_id)})
            if user_data:
                return cls.from_dict(user_data)
        except Exception as e:
            current_app.logger.error(f"Error finding user by ID '{user_id}': {e}")
        return None

    @classmethod
    def get_all(cls, query={}, page=1, per_page=10):
        """Finds all users with pagination and filtering."""
        db = get_db()
        skip = (page - 1) * per_page
        users_cursor = db.users.find(query).skip(skip).limit(per_page)
        return [cls.from_dict(user_data) for user_data in users_cursor]

    @classmethod
    def get_count(cls, query={}):
        """Gets the total count of users for a given query."""
        db = get_db()
        return db.users.count_documents(query)

    @classmethod
    def from_dict(cls, user_dict):
        """Creates a User instance from a dictionary (e.g., a MongoDB document)."""
        # REFACTOR: Simplified to pass values directly to the constructor.
        # The password hash is now correctly handled.
        return cls(
            _id=user_dict.get("_id"),
            name=user_dict.get("name"),
            email=user_dict.get("email"),
            password_hash=user_dict.get("password_hash"), # Use the consistent field name
            role=user_dict.get("role", "user"),
            is_verified=user_dict.get("is_verified", False),
            created_at=user_dict.get("created_at"),
            last_login=user_dict.get("last_login"),
            otp=user_dict.get("otp"),
            otp_expires_at=user_dict.get("otp_expires_at")
        )

# REMOVED: Redundant helper functions `user_to_mongo` and `user_from_mongo`
# The class methods `to_dict` and `from_dict` already provide this functionality.