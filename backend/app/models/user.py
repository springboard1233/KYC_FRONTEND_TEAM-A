# FILE: backend/app/models/user.py
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId
from flask import current_app
from app.utils.database import get_db

class User:
    def __init__(self, name, email, password=None, role="user", is_verified=False, _id=None, created_at=None, last_login=None, otp=None, otp_expires_at=None):
        self._id = _id
        self.name = name
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.role = role
        self.is_verified = is_verified
        self.created_at = created_at or datetime.utcnow()
        self.last_login = last_login
        self.otp = otp
        self.otp_expires_at = otp_expires_at

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def save(self):
        db = get_db()
        user_data = {
            "name": self.name,
            "email": self.email,
            "password": self.password_hash,
            "role": self.role,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "otp": self.otp,
            "otp_expires_at": self.otp_expires_at,
        }
        
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
        self.last_login = datetime.utcnow()
        return self.save()

    def to_dict(self):
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
        db = get_db()
        user_data = db.users.find_one({"email": email})
        if user_data:
            return cls.from_dict(user_data)
        return None

    @classmethod
    def find_by_id(cls, user_id):
        db = get_db()
        try:
            user_data = db.users.find_one({"_id": ObjectId(user_id)})
            if user_data:
                return cls.from_dict(user_data)
        except Exception as e:
            current_app.logger.error(f"Error finding user by ID: {e}")
        return None

    @classmethod
    def get_all(cls, query={}, page=1, per_page=10):
        """Find all users with pagination and filtering."""
        db = get_db()
        skip = (page - 1) * per_page
        users_cursor = db.users.find(query).skip(skip).limit(per_page)
        return [cls.from_dict(user_data) for user_data in users_cursor]

    @classmethod
    def get_count(cls, query={}):
        """Get the total count of users for a given query."""
        db = get_db()
        return db.users.count_documents(query)


    @classmethod
    def from_dict(cls, user_dict):
        user = cls(
            _id=user_dict.get("_id"),
            name=user_dict.get("name"),
            email=user_dict.get("email"),
            role=user_dict.get("role", "user"),
            is_verified=user_dict.get("is_verified", False),
            created_at=user_dict.get("created_at"),
            otp=user_dict.get("otp"),
            otp_expires_at=user_dict.get("otp_expires_at")
        )
        # Manually set password hash and last_login from the database document
        user.password_hash = user_dict.get("password")
        user.last_login = user_dict.get("last_login")
        return user

# Helper functions for MongoDB conversion
def user_to_mongo(user):
    """Convert User object to MongoDB document"""
    if not user:
        return None
    
    return {
        "name": user.name,
        "email": user.email,
        "password": user.password_hash,
        "role": user.role,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
        "last_login": user.last_login
    }

def user_from_mongo(user_dict):
    """Convert MongoDB document to User object"""
    if not user_dict:
        return None
    
    return User(
        _id=user_dict.get("_id"),
        name=user_dict.get("name"),
        email=user_dict.get("email"),
        role=user_dict.get("role", "user"),
        is_verified=user_dict.get("is_verified", False),
        created_at=user_dict.get("created_at"),
        last_login=user_dict.get("last_login")
    )