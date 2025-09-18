# models/user.py - Enhanced User Model for AI-Powered KYC System

import re
import hashlib
import secrets
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from email_validator import validate_email, EmailNotValidError
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class EnhancedUser:
    """
    🚀 Enhanced User model with comprehensive features for AI-Powered KYC System
    
    Features:
    - Advanced authentication with OTP support
    - Role-based access control (user, admin)
    - Account security and validation
    - Session management
    - Audit trail integration
    - Profile management
    """
    
    def __init__(self, email, password, name=None, role='user', phone=None):
        """Initialize user with enhanced validation"""
        self.email = self._validate_email(email)
        self.password_hash = generate_password_hash(password)
        self.name = name or self._generate_name_from_email(email)
        self.role = self._validate_role(role)
        self.phone = self._validate_phone(phone) if phone else None
        
        # User status and security
        self.is_active = True
        self.is_verified = False
        self.email_verified = False
        self.phone_verified = False
        self.account_locked = False
        
        # Timestamps
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.last_login = None
        self.last_password_change = datetime.utcnow()
        
        # Authentication tracking
        self.login_count = 0
        self.failed_login_attempts = 0
        self.last_failed_login = None
        
        # OTP and verification
        self.otp_secret = None
        self.backup_codes = self._generate_backup_codes()
        
        # Profile and preferences
        self.profile_image = None
        self.timezone = 'UTC'
        self.language = 'en'
        self.notification_preferences = {
            'email_notifications': True,
            'security_alerts': True,
            'document_updates': True
        }
        
        # System tracking
        self.registration_ip = None
        self.last_login_ip = None
        self.user_agent = None
    
    @staticmethod
    def _validate_email(email):
        """🔍 Enhanced email validation"""
        try:
            if not email or not isinstance(email, str):
                raise ValueError("Email is required")
            
            email = email.strip().lower()
            
            # Basic format check
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                raise ValueError("Invalid email format")
            
            # Use email-validator for comprehensive validation
            validation = validate_email(email)
            validated_email = validation.email
            
            # Additional security checks
            suspicious_domains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com']
            domain = validated_email.split('@')[1]
            if domain in suspicious_domains:
                raise ValueError("Temporary email addresses are not allowed")
            
            return validated_email
            
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email: {str(e)}")
        except Exception as e:
            raise ValueError(f"Email validation failed: {str(e)}")
    
    @staticmethod
    def _validate_password(password):
        """🔒 Enhanced password validation with security requirements"""
        if not password or not isinstance(password, str):
            raise ValueError("Password is required")
        
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        if len(password) > 128:
            raise ValueError("Password must be less than 128 characters")
        
        # Strength requirements
        checks = {
            'lowercase': re.search(r'[a-z]', password),
            'uppercase': re.search(r'[A-Z]', password),
            'digit': re.search(r'\d', password),
            'special': re.search(r'[!@#$%^&*(),.?":{}|<>]', password)
        }
        
        missing = [name for name, check in checks.items() if not check]
        
        if len(missing) > 2:  # Allow flexibility but ensure reasonable strength
            requirements = {
                'lowercase': 'lowercase letter',
                'uppercase': 'uppercase letter', 
                'digit': 'number',
                'special': 'special character'
            }
            missing_text = ', '.join(requirements[req] for req in missing)
            raise ValueError(f"Password must contain at least: {missing_text}")
        
        # Common password check
        common_passwords = ['password', '123456', 'qwerty', 'admin', 'letmein']
        if password.lower() in common_passwords:
            raise ValueError("Password is too common")
        
        return True
    
    @staticmethod
    def _validate_role(role):
        """👤 Validate user role"""
        valid_roles = ['user', 'admin', 'moderator', 'viewer']
        if role not in valid_roles:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(valid_roles)}")
        return role
    
    @staticmethod
    def _validate_phone(phone):
        """📱 Enhanced phone validation"""
        if not phone:
            return None
        
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Basic validation - should be 10-15 digits
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError("Invalid phone number format")
        
        return digits_only
    
    @staticmethod
    def _generate_name_from_email(email):
        """📝 Generate display name from email"""
        username = email.split('@')[0]
        # Capitalize first letter and remove numbers/special chars
        name = re.sub(r'[^a-zA-Z\s]', ' ', username).strip().title()
        return name if name else 'User'
    
    def _generate_backup_codes(self):
        """🔑 Generate backup authentication codes"""
        codes = []
        for _ in range(10):
            code = secrets.token_hex(4).upper()
            codes.append(code)
        return codes
    
    def to_dict(self, include_sensitive=False, include_profile=True):
        """📋 Convert user to dictionary with privacy controls"""
        user_data = {
            'id': str(getattr(self, '_id', '')),
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'email_verified': getattr(self, 'email_verified', False),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'login_count': getattr(self, 'login_count', 0)
        }
        
        if include_profile:
            user_data.update({
                'phone': getattr(self, 'phone', None),
                'phone_verified': getattr(self, 'phone_verified', False),
                'timezone': getattr(self, 'timezone', 'UTC'),
                'language': getattr(self, 'language', 'en'),
                'profile_image': getattr(self, 'profile_image', None),
                'notification_preferences': getattr(self, 'notification_preferences', {})
            })
        
        if include_sensitive:
            user_data.update({
                'password_hash': self.password_hash,
                'failed_login_attempts': getattr(self, 'failed_login_attempts', 0),
                'account_locked': getattr(self, 'account_locked', False),
                'backup_codes': getattr(self, 'backup_codes', []),
                'registration_ip': getattr(self, 'registration_ip', None),
                'last_login_ip': getattr(self, 'last_login_ip', None)
            })
        
        return user_data
    
    def check_password(self, password):
        """✅ Verify password with security tracking"""
        try:
            is_valid = check_password_hash(self.password_hash, password)
            
            if not is_valid:
                self.failed_login_attempts = getattr(self, 'failed_login_attempts', 0) + 1
                self.last_failed_login = datetime.utcnow()
                
                # Lock account after 5 failed attempts
                if self.failed_login_attempts >= 5:
                    self.account_locked = True
                    logger.warning(f"Account locked for user: {self.email}")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Password check error for {self.email}: {str(e)}")
            return False
    
    def update_login_info(self, ip_address=None, user_agent=None):
        """📊 Update login tracking information"""
        self.last_login = datetime.utcnow()
        self.login_count = getattr(self, 'login_count', 0) + 1
        self.failed_login_attempts = 0  # Reset on successful login
        self.account_locked = False     # Unlock on successful login
        self.updated_at = datetime.utcnow()
        
        if ip_address:
            self.last_login_ip = ip_address
        if user_agent:
            self.user_agent = user_agent
        
        logger.info(f"Login info updated for user: {self.email}")
    
    def change_password(self, old_password, new_password):
        """🔐 Change password with validation"""
        if not self.check_password(old_password):
            raise ValueError("Current password is incorrect")
        
        self._validate_password(new_password)
        
        # Check if new password is different
        if check_password_hash(self.password_hash, new_password):
            raise ValueError("New password must be different from current password")
        
        self.password_hash = generate_password_hash(new_password)
        self.last_password_change = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        logger.info(f"Password changed for user: {self.email}")
        return True
    
    def verify_email(self):
        """✉️ Mark email as verified"""
        self.email_verified = True
        self.is_verified = self.email_verified and getattr(self, 'phone_verified', True)
        self.updated_at = datetime.utcnow()
        logger.info(f"Email verified for user: {self.email}")
    
    def verify_phone(self):
        """📱 Mark phone as verified"""
        self.phone_verified = True
        self.is_verified = self.email_verified and self.phone_verified
        self.updated_at = datetime.utcnow()
        logger.info(f"Phone verified for user: {self.email}")
    
    def unlock_account(self):
        """🔓 Unlock user account"""
        self.account_locked = False
        self.failed_login_attempts = 0
        self.updated_at = datetime.utcnow()
        logger.info(f"Account unlocked for user: {self.email}")
    
    def update_profile(self, **kwargs):
        """📝 Update user profile information"""
        allowed_fields = [
            'name', 'phone', 'timezone', 'language', 
            'notification_preferences', 'profile_image'
        ]
        
        updated = False
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(self, field):
                if field == 'phone':
                    value = self._validate_phone(value)
                setattr(self, field, value)
                updated = True
        
        if updated:
            self.updated_at = datetime.utcnow()
            logger.info(f"Profile updated for user: {self.email}")
        
        return updated
    
    def generate_otp(self, length=6):
        """🔢 Generate OTP code"""
        otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
        return otp
    
    def save(self, db):
        """💾 Save user to database with enhanced error handling"""
        try:
            users_collection = db.get_collection('users')
            
            user_data = {
                'email': self.email,
                'password_hash': self.password_hash,
                'name': self.name,
                'role': self.role,
                'phone': getattr(self, 'phone', None),
                'is_active': self.is_active,
                'is_verified': self.is_verified,
                'email_verified': getattr(self, 'email_verified', False),
                'phone_verified': getattr(self, 'phone_verified', False),
                'account_locked': getattr(self, 'account_locked', False),
                'created_at': self.created_at,
                'updated_at': self.updated_at,
                'last_login': self.last_login,
                'last_password_change': getattr(self, 'last_password_change', self.created_at),
                'login_count': getattr(self, 'login_count', 0),
                'failed_login_attempts': getattr(self, 'failed_login_attempts', 0),
                'last_failed_login': getattr(self, 'last_failed_login', None),
                'backup_codes': getattr(self, 'backup_codes', []),
                'timezone': getattr(self, 'timezone', 'UTC'),
                'language': getattr(self, 'language', 'en'),
                'notification_preferences': getattr(self, 'notification_preferences', {}),
                'profile_image': getattr(self, 'profile_image', None),
                'registration_ip': getattr(self, 'registration_ip', None),
                'last_login_ip': getattr(self, 'last_login_ip', None),
                'user_agent': getattr(self, 'user_agent', None)
            }
            
            if hasattr(self, '_id'):
                # Update existing user
                users_collection.update_one(
                    {'_id': self._id}, 
                    {'$set': user_data}
                )
                logger.info(f"User updated: {self.email}")
                return self._id
            else:
                # Create new user
                result = users_collection.insert_one(user_data)
                self._id = result.inserted_id
                logger.info(f"New user created: {self.email}")
                return result.inserted_id
                
        except Exception as e:
            logger.error(f"Failed to save user {self.email}: {str(e)}")
            raise
    
    @staticmethod
    def find_by_email(db, email):
        """🔍 Find user by email with comprehensive data loading"""
        try:
            users_collection = db.get_collection('users')
            user_data = users_collection.find_one({'email': email.lower()})
            
            if user_data:
                user = EnhancedUser.__new__(EnhancedUser)
                user._id = user_data['_id']
                user.email = user_data['email']
                user.password_hash = user_data['password_hash']
                user.name = user_data['name']
                user.role = user_data.get('role', 'user')
                user.phone = user_data.get('phone')
                user.is_active = user_data.get('is_active', True)
                user.is_verified = user_data.get('is_verified', False)
                user.email_verified = user_data.get('email_verified', False)
                user.phone_verified = user_data.get('phone_verified', False)
                user.account_locked = user_data.get('account_locked', False)
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.updated_at = user_data.get('updated_at', datetime.utcnow())
                user.last_login = user_data.get('last_login')
                user.last_password_change = user_data.get('last_password_change', user.created_at)
                user.login_count = user_data.get('login_count', 0)
                user.failed_login_attempts = user_data.get('failed_login_attempts', 0)
                user.last_failed_login = user_data.get('last_failed_login')
                user.backup_codes = user_data.get('backup_codes', [])
                user.timezone = user_data.get('timezone', 'UTC')
                user.language = user_data.get('language', 'en')
                user.notification_preferences = user_data.get('notification_preferences', {})
                user.profile_image = user_data.get('profile_image')
                user.registration_ip = user_data.get('registration_ip')
                user.last_login_ip = user_data.get('last_login_ip')
                user.user_agent = user_data.get('user_agent')
                
                return user
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to find user by email {email}: {str(e)}")
            return None
    
    @staticmethod
    def find_by_id(db, user_id):
        """🆔 Find user by ID"""
        try:
            users_collection = db.get_collection('users')
            user_data = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if user_data:
                user = EnhancedUser.__new__(EnhancedUser)
                # Load all fields similar to find_by_email
                user._id = user_data['_id']
                user.email = user_data['email']
                user.password_hash = user_data['password_hash']
                user.name = user_data['name']
                user.role = user_data.get('role', 'user')
                user.phone = user_data.get('phone')
                user.is_active = user_data.get('is_active', True)
                user.is_verified = user_data.get('is_verified', False)
                user.email_verified = user_data.get('email_verified', False)
                user.phone_verified = user_data.get('phone_verified', False)
                user.account_locked = user_data.get('account_locked', False)
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.updated_at = user_data.get('updated_at', datetime.utcnow())
                user.last_login = user_data.get('last_login')
                user.login_count = user_data.get('login_count', 0)
                user.failed_login_attempts = user_data.get('failed_login_attempts', 0)
                user.backup_codes = user_data.get('backup_codes', [])
                user.timezone = user_data.get('timezone', 'UTC')
                user.language = user_data.get('language', 'en')
                user.notification_preferences = user_data.get('notification_preferences', {})
                user.profile_image = user_data.get('profile_image')
                user.last_login_ip = user_data.get('last_login_ip')
                
                return user
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to find user by ID {user_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_user(db, email, password, name=None, role='user', **kwargs):
        """🆕 Create new user with comprehensive validation"""
        try:
            # Validate inputs
            EnhancedUser._validate_email(email)
            EnhancedUser._validate_password(password)
            
            # Check if user already exists
            if EnhancedUser.find_by_email(db, email):
                raise ValueError("User with this email already exists")
            
            # Create user
            user = EnhancedUser(email.lower(), password, name, role, **kwargs)
            
            # Save to database
            user_id = user.save(db)
            
            if user_id:
                # Log user creation
                db.log_audit_event(user_id, 'user_created', {
                    'email': email,
                    'role': role,
                    'created_at': user.created_at.isoformat()
                })
                
                logger.info(f"✅ New user created successfully: {email}")
                return user
            else:
                raise Exception("Failed to save user to database")
                
        except ValueError as e:
            logger.warning(f"User creation validation failed: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"User creation failed: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")
    
    @staticmethod
    def get_all_users(db, page=1, per_page=10, filters=None):
        """📋 Get paginated list of users with filtering"""
        try:
            users_collection = db.get_collection('users')
            
            # Build query
            query = {}
            if filters:
                if filters.get('role'):
                    query['role'] = filters['role']
                if filters.get('is_active') is not None:
                    query['is_active'] = filters['is_active']
                if filters.get('is_verified') is not None:
                    query['is_verified'] = filters['is_verified']
            
            # Count total
            total_count = users_collection.count_documents(query)
            
            # Get paginated results
            skip = (page - 1) * per_page
            cursor = users_collection.find(query).sort('created_at', -1).skip(skip).limit(per_page)
            
            users = []
            for user_data in cursor:
                user = EnhancedUser.__new__(EnhancedUser)
                user._id = user_data['_id']
                user.email = user_data['email']
                user.name = user_data['name']
                user.role = user_data.get('role', 'user')
                user.is_active = user_data.get('is_active', True)
                user.is_verified = user_data.get('is_verified', False)
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.last_login = user_data.get('last_login')
                user.login_count = user_data.get('login_count', 0)
                users.append(user)
            
            return users, total_count
            
        except Exception as e:
            logger.error(f"Failed to get users: {str(e)}")
            raise

# Alias for backward compatibility
User = EnhancedUser

# Export for use in other modules
__all__ = ['EnhancedUser', 'User']
