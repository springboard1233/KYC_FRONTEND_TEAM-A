from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from flask import current_app

class Database:
    """MongoDB database utility class"""
    
    def __init__(self):
        self.client = None
        self.db = None
    
    def connect(self, mongo_uri=None, db_name=None):
        """Connect to MongoDB"""
        try:
            mongo_uri = mongo_uri or current_app.config['MONGO_URI']
            db_name = db_name or current_app.config['MONGO_DB_NAME']
            
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            
            # Test connection
            self.client.admin.command('ping')
            
            self.db = self.client[db_name]
            print(f"✅ Connected to MongoDB: {db_name}")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False
    
    def get_collection(self, collection_name):
        """Get a collection from the database"""
        if not self.db:
            raise Exception("Database not connected")
        return self.db[collection_name]
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("✅ MongoDB connection closed")

# Global database instance
db = Database()
