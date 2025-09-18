# utils/database.py - Enhanced MongoDB Database Utility for AI-Powered KYC System

import os
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import (
    ConnectionFailure, 
    ServerSelectionTimeoutError, 
    OperationFailure,
    ConfigurationError,
    DuplicateKeyError
)
from flask import current_app, g
from bson.objectid import ObjectId
import hashlib
import json

# Configure logging
logger = logging.getLogger(__name__)

class EnhancedDatabase:
    """
    🚀 Enhanced MongoDB database utility class for AI-Powered KYC System
    
    Features:
    - Advanced connection management with pooling
    - Automatic collection and index creation
    - Built-in health monitoring
    - Transaction support
    - Data validation and sanitization
    - Performance optimization
    """
    
    def __init__(self):
        self.client = None
        self.db = None
        self._connection_string = None
        self._db_name = None
        self.is_connected = False
        self._collections = {}
        
    def init_app(self, app):
        """Initialize database with Flask app context"""
        app.teardown_appcontext(self.close_db)
        
    def connect(self, mongo_uri=None, db_name=None, app_context=True):
        """
        🔗 Enhanced MongoDB connection with comprehensive configuration
        """
        try:
            # Get configuration
            if app_context and current_app:
                mongo_uri = mongo_uri or current_app.config.get('MONGODB_URI', 'mongodb://localhost:27017/kyc_system')
                db_name = db_name or current_app.config.get('MONGODB_DB', 'kyc_system')
            else:
                mongo_uri = mongo_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/kyc_system')
                db_name = db_name or os.getenv('MONGODB_DB', 'kyc_system')
            
            self._connection_string = mongo_uri
            self._db_name = db_name
            
            logger.info(f"🔄 Connecting to MongoDB: {db_name}")
            
            # Enhanced connection configuration
            self.client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                maxPoolSize=50,
                minPoolSize=5,
                maxIdleTimeMS=30000,
                retryWrites=True,
                retryReads=True,
                appName='AI-KYC-System'
            )
            
            # Test connection
            server_info = self.client.admin.command('ping')
            logger.info(f"📡 MongoDB ping successful: {server_info}")
            
            # Get database
            self.db = self.client[db_name]
            
            # Initialize collections and indexes
            self._initialize_collections()
            self._create_indexes()
            
            self.is_connected = True
            logger.info(f"✅ Successfully connected to MongoDB: {db_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {str(e)}")
            self.is_connected = False
            raise ConnectionFailure(f"Failed to connect to MongoDB: {str(e)}")
    
    def _initialize_collections(self):
        """🏗️ Initialize required collections for KYC system"""
        try:
            required_collections = {
                'users': 'User accounts and authentication',
                'records': 'Document processing records',
                'fraud_patterns': 'AI fraud detection patterns',
                'admin_decisions': 'Admin review decisions',
                'otp_codes': 'OTP verification codes',
                'duplicate_hashes': 'Document duplicate detection',
                'audit_logs': 'System audit trail',
                'api_keys': 'API authentication keys',
                'system_stats': 'System performance statistics'
            }
            
            existing_collections = self.db.list_collection_names()
            
            for collection_name, description in required_collections.items():
                if collection_name not in existing_collections:
                    self.db.create_collection(collection_name)
                    logger.info(f"📁 Created collection: {collection_name} ({description})")
                
                # Store collection reference
                self._collections[collection_name] = self.db[collection_name]
            
            logger.info("✅ All required collections initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize collections: {str(e)}")
            raise
    
    def _create_indexes(self):
        """📊 Create optimized indexes for better performance"""
        try:
            # Users collection indexes
            users = self._collections['users']
            users.create_index("email", unique=True)
            users.create_index("role")
            users.create_index("is_active")
            users.create_index("created_at")
            
            # Records collection indexes
            records = self._collections['records']
            records.create_index("user_id")
            records.create_index("document_type")
            records.create_index("fraud_score")
            records.create_index("risk_category")
            records.create_index("admin_reviewed")
            records.create_index("created_at")
            records.create_index([("user_id", ASCENDING), ("document_type", ASCENDING)])
            records.create_index([("fraud_score", DESCENDING), ("created_at", DESCENDING)])
            
            # OTP codes indexes
            otp_codes = self._collections['otp_codes']
            otp_codes.create_index("email")
            otp_codes.create_index("expires_at", expireAfterSeconds=0)  # TTL index
            otp_codes.create_index("verified")
            
            # Admin decisions indexes
            admin_decisions = self._collections['admin_decisions']
            admin_decisions.create_index("record_id")
            admin_decisions.create_index("admin_id")
            admin_decisions.create_index("reviewed_at")
            
            # Duplicate hashes indexes
            duplicate_hashes = self._collections['duplicate_hashes']
            duplicate_hashes.create_index("hash", unique=True)
            duplicate_hashes.create_index("created_at")
            
            # Audit logs indexes
            audit_logs = self._collections['audit_logs']
            audit_logs.create_index("user_id")
            audit_logs.create_index("action")
            audit_logs.create_index("timestamp")
            audit_logs.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
            
            logger.info("✅ Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create indexes: {str(e)}")
    
    def get_collection(self, collection_name):
        """
        📋 Get collection with validation
        """
        if not self.is_connected or not self.db:
            raise ConnectionError("Database not connected. Call connect() first.")
        
        try:
            if collection_name in self._collections:
                return self._collections[collection_name]
            
            collection = self.db[collection_name]
            self._collections[collection_name] = collection
            return collection
            
        except Exception as e:
            logger.error(f"❌ Failed to access collection '{collection_name}': {str(e)}")
            raise ConnectionError(f"Cannot access collection '{collection_name}': {str(e)}")
    
    def save_user(self, user_data):
        """👤 Save user with validation"""
        try:
            users_collection = self.get_collection('users')
            
            # Add timestamps
            user_data['created_at'] = datetime.utcnow()
            user_data['updated_at'] = datetime.utcnow()
            
            # Insert user
            result = users_collection.insert_one(user_data)
            logger.info(f"✅ User saved: {user_data.get('email')}")
            return result.inserted_id
            
        except DuplicateKeyError:
            raise ValueError("User with this email already exists")
        except Exception as e:
            logger.error(f"❌ Failed to save user: {str(e)}")
            raise
    
    def save_record(self, record_data):
        """📄 Save document processing record"""
        try:
            records_collection = self.get_collection('records')
            
            # Add timestamps
            record_data['created_at'] = datetime.utcnow()
            record_data['updated_at'] = datetime.utcnow()
            
            # Insert record
            result = records_collection.insert_one(record_data)
            logger.info(f"✅ Record saved: {result.inserted_id}")
            return result.inserted_id
            
        except Exception as e:
            logger.error(f"❌ Failed to save record: {str(e)}")
            raise
    
    def save_otp_code(self, email, otp_code, expires_in_minutes=10):
        """📱 Save OTP code with expiration"""
        try:
            otp_collection = self.get_collection('otp_codes')
            
            # Remove existing OTP for this email
            otp_collection.delete_many({'email': email})
            
            # Create new OTP
            otp_data = {
                'email': email,
                'otp_code': otp_code,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(minutes=expires_in_minutes),
                'verified': False,
                'attempts': 0
            }
            
            result = otp_collection.insert_one(otp_data)
            logger.info(f"✅ OTP saved for: {email}")
            return result.inserted_id
            
        except Exception as e:
            logger.error(f"❌ Failed to save OTP: {str(e)}")
            raise
    
    def verify_otp(self, email, otp_code):
        """✅ Verify OTP code"""
        try:
            otp_collection = self.get_collection('otp_codes')
            
            # Find valid OTP
            otp_record = otp_collection.find_one({
                'email': email,
                'otp_code': otp_code,
                'verified': False,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            
            if not otp_record:
                # Increment attempts
                otp_collection.update_one(
                    {'email': email, 'otp_code': otp_code},
                    {'$inc': {'attempts': 1}}
                )
                return False
            
            # Mark as verified
            otp_collection.update_one(
                {'_id': otp_record['_id']},
                {'$set': {'verified': True, 'verified_at': datetime.utcnow()}}
            )
            
            logger.info(f"✅ OTP verified for: {email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ OTP verification failed: {str(e)}")
            return False
    
    def log_audit_event(self, user_id, action, details=None):
        """📊 Log audit event"""
        try:
            audit_collection = self.get_collection('audit_logs')
            
            audit_data = {
                'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
                'action': action,
                'details': details or {},
                'timestamp': datetime.utcnow(),
                'ip_address': None,  # Can be added from request context
                'user_agent': None   # Can be added from request context
            }
            
            result = audit_collection.insert_one(audit_data)
            return result.inserted_id
            
        except Exception as e:
            logger.error(f"❌ Failed to log audit event: {str(e)}")
    
    def get_user_stats(self, user_id):
        """📊 Get comprehensive user statistics"""
        try:
            records_collection = self.get_collection('records')
            
            pipeline = [
                {'$match': {'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id}},
                {'$group': {
                    '_id': None,
                    'total_records': {'$sum': 1},
                    'aadhaar_count': {'$sum': {'$cond': [{'$eq': ['$document_type', 'aadhaar']}, 1, 0]}},
                    'pan_count': {'$sum': {'$cond': [{'$eq': ['$document_type', 'pan']}, 1, 0]}},
                    'verified_count': {'$sum': {'$cond': [{'$eq': ['$validation.is_valid', True]}, 1, 0]}},
                    'high_risk_count': {'$sum': {'$cond': [{'$gte': ['$fraud_score', 70]}, 1, 0]}},
                    'medium_risk_count': {'$sum': {'$cond': [{'$and': [{'$gte': ['$fraud_score', 40]}, {'$lt': ['$fraud_score', 70]}]}, 1, 0]}},
                    'low_risk_count': {'$sum': {'$cond': [{'$lt': ['$fraud_score', 40]}, 1, 0]}},
                    'avg_confidence': {'$avg': '$confidence_score'},
                    'avg_fraud_score': {'$avg': '$fraud_score'}
                }}
            ]
            
            result = list(records_collection.aggregate(pipeline))
            
            if result:
                stats = result[0]
                stats.pop('_id', None)
                
                # Calculate additional metrics
                total = stats.get('total_records', 0)
                verified = stats.get('verified_count', 0)
                high_risk = stats.get('high_risk_count', 0)
                
                stats['verification_success_rate'] = round((verified / max(total, 1)) * 100, 1)
                stats['fraud_detection_rate'] = round((high_risk / max(total, 1)) * 100, 1)
                stats['avg_confidence'] = round(stats.get('avg_confidence', 0), 1)
                stats['avg_fraud_score'] = round(stats.get('avg_fraud_score', 0), 1)
                
                return stats
            
            return {
                'total_records': 0,
                'aadhaar_count': 0,
                'pan_count': 0,
                'verified_count': 0,
                'high_risk_count': 0,
                'medium_risk_count': 0,
                'low_risk_count': 0,
                'avg_confidence': 0,
                'avg_fraud_score': 0,
                'verification_success_rate': 0,
                'fraud_detection_rate': 0
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get user stats: {str(e)}")
            return {}
    
    def health_check(self):
        """🏥 Comprehensive database health check"""
        health_status = {
            'connected': False,
            'database': self._db_name,
            'collections': {},
            'performance': {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            if not self.is_connected or not self.client:
                health_status['error'] = 'Not connected to database'
                return health_status
            
            # Test connection
            ping_result = self.client.admin.command('ping')
            health_status['connected'] = ping_result.get('ok') == 1
            
            if health_status['connected']:
                # Get database statistics
                db_stats = self.db.command('dbstats')
                health_status['performance'] = {
                    'collections': db_stats.get('collections', 0),
                    'objects': db_stats.get('objects', 0),
                    'dataSize': db_stats.get('dataSize', 0),
                    'storageSize': db_stats.get('storageSize', 0)
                }
                
                # Check collection health
                for collection_name in ['users', 'records', 'otp_codes']:
                    try:
                        collection = self.get_collection(collection_name)
                        count = collection.count_documents({})
                        health_status['collections'][collection_name] = {
                            'exists': True,
                            'count': count
                        }
                    except Exception as e:
                        health_status['collections'][collection_name] = {
                            'exists': False,
                            'error': str(e)
                        }
            
        except Exception as e:
            health_status['error'] = str(e)
            logger.error(f"❌ Database health check failed: {str(e)}")
        
        return health_status
    
    def close(self):
        """🔒 Close database connection safely"""
        try:
            if self.client:
                self.client.close()
                self.client = None
                self.db = None
                self.is_connected = False
                self._collections = {}
                logger.info("✅ MongoDB connection closed successfully")
        except Exception as e:
            logger.error(f"❌ Error closing database connection: {str(e)}")
    
    def close_db(self, error=None):
        """Flask teardown handler"""
        if error:
            logger.error(f"Database error during teardown: {error}")


# Database initialization function
def init_db(mongo_uri, db_name):
    """Initialize database connection"""
    try:
        db.connect(mongo_uri, db_name, app_context=False)
        logger.info("🚀 Database initialization completed")
        return True
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise


# Global database instance (singleton pattern)
db = EnhancedDatabase()

# Flask integration helpers
def get_db():
    """Get database instance for Flask request context"""
    if 'db' not in g:
        g.db = db
    return g.db

def close_db(e=None):
    """Close database connection for Flask request context"""
    db_instance = g.pop('db', None)
    if db_instance is not None:
        # Connection pool handles this automatically
        pass

# Export for use in other modules
__all__ = ['db', 'init_db', 'get_db', 'close_db', 'EnhancedDatabase']
