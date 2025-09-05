from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson.objectid import ObjectId
from email_validator import validate_email, EmailNotValidError
import re

class User:
    """User model for authentication and user management"""
    
    def __init__(self, email, password, name=None, role='user'):
        self.email = self._validate_email(email)
        self.password_hash = generate_password_hash(password)
        self.name = name or email.split('@')[0]
        self.role = role
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
        self.is_verified = False
        self.login_count = 0
        self.last_login = None
    
    @staticmethod
    def _validate_email(email):
        """Validate email format"""
        try:
            validation = validate_email(email)
            return validation.email
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email: {str(e)}")
    
    @staticmethod
    def _validate_password(password):
        """Validate password strength"""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        if not re.search(r"[A-Za-z]", password):
            raise ValueError("Password must contain at least one letter")
        
        if not re.search(r"\d", password):
            raise ValueError("Password must contain at least one number")
        
        return True
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        user_data = {
            'id': str(getattr(self, '_id', '')),
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'login_count': getattr(self, 'login_count', 0),
            'last_login': self.last_login.isoformat() if getattr(self, 'last_login', None) else None
        }
        
        if include_sensitive:
            user_data['password_hash'] = self.password_hash
        
        return user_data
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def update_login_info(self):
        """Update login timestamp and count"""
        self.last_login = datetime.utcnow()
        self.login_count = getattr(self, 'login_count', 0) + 1
        self.updated_at = datetime.utcnow()
    
    @staticmethod
    def find_by_email(db, email):
        """Find user by email"""
        users_collection = db.get_collection('users')
        user_data = users_collection.find_one({'email': email.lower()})
        
        if user_data:
            user = User.__new__(User)
            user._id = user_data['_id']
            user.email = user_data['email']
            user.password_hash = user_data['password_hash']
            user.name = user_data['name']
            user.role = user_data.get('role', 'user')
            user.created_at = user_data.get('created_at', datetime.utcnow())
            user.updated_at = user_data.get('updated_at', datetime.utcnow())
            user.is_active = user_data.get('is_active', True)
            user.is_verified = user_data.get('is_verified', False)
            user.login_count = user_data.get('login_count', 0)
            user.last_login = user_data.get('last_login')
            return user
        return None
    
    @staticmethod
    def find_by_id(db, user_id):
        """Find user by ID"""
        users_collection = db.get_collection('users')
        try:
            user_data = users_collection.find_one({'_id': ObjectId(user_id)})
            if user_data:
                user = User.__new__(User)
                user._id = user_data['_id']
                user.email = user_data['email']
                user.password_hash = user_data['password_hash']
                user.name = user_data['name']
                user.role = user_data.get('role', 'user')
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.updated_at = user_data.get('updated_at', datetime.utcnow())
                user.is_active = user_data.get('is_active', True)
                user.is_verified = user_data.get('is_verified', False)
                user.login_count = user_data.get('login_count', 0)
                user.last_login = user_data.get('last_login')
                return user
        except Exception:
            pass
        return None
    
    @staticmethod
    def create_user(db, email, password, name=None, role='user'):
        """Create a new user with validation"""
        # Validate inputs
        User._validate_email(email)
        User._validate_password(password)
        
        # Check if user already exists
        if User.find_by_email(db, email):
            raise ValueError("User with this email already exists")
        
        # Create user
        user = User(email.lower(), password, name, role)
        result = user.save(db)
        
        if result:
            return user
        else:
            raise Exception("Failed to create user")
    
    def save(self, db):
        """Save user to database"""
        users_collection = db.get_collection('users')
        
        user_data = {
            'email': self.email.lower(),
            'password_hash': self.password_hash,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'login_count': getattr(self, 'login_count', 0),
            'last_login': getattr(self, 'last_login', None)
        }
        
        if hasattr(self, '_id'):
            # Update existing user
            users_collection.update_one({'_id': self._id}, {'$set': user_data})
            return self._id
        else:
            # Create new user
            result = users_collection.insert_one(user_data)
            self._id = result.inserted_id
            return result.inserted_id
