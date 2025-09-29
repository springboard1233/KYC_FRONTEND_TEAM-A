# FILE: backend/app/utils/database.py
from flask import current_app, g
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):
        """Initialize database with Flask app"""
        try:
            # Get MongoDB URI from app config
            mongo_uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/kyc_database')
            
            # Connect to MongoDB
            self.client = MongoClient(mongo_uri)
            self.db = self.client.get_database()
            
            # Test connection
            self.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {mongo_uri}")
            
            # Register teardown function
            app.teardown_appcontext(self.close_connection)
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection error: {str(e)}")
            raise

    def get_collection(self, collection_name):
        """Get a MongoDB collection"""
        if not self.db:
            raise RuntimeError("Database not initialized. Call init_app first.")
        return self.db[collection_name]

    def close_connection(self, exception=None):
        """Close MongoDB connection"""
        if hasattr(g, 'mongo_client'):
            g.mongo_client.close()

db = Database()

def close_db(e=None):
    """Close database connection at the end of request"""
    if db.client:
        db.client.close()

def get_db():
    """
    Returns the initialized database instance for the application.
    """
    if db.db is None:
        raise RuntimeError("Database not initialized. Ensure create_app is called and the app context is available.")
    return db.db