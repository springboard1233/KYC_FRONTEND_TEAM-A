# backend/db_connector.py
import os
import logging
from pymongo import MongoClient
from pymongo.database import Database

# Configure logger
logger = logging.getLogger(__name__)

class DBConnector:
    """A dedicated connector for MongoDB for standalone services."""
    client: MongoClient = None
    db: Database = None

db_connector = DBConnector()

def init_db_connection():
    """Initializes the database connection using environment variables."""
    try:
        if db_connector.client is None:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
            db_name = os.getenv("MONGO_DB_NAME", "kyc_database")
            
            db_connector.client = MongoClient(mongo_uri)
            db_connector.client.admin.command("ping")  # Test connection
            db_connector.db = db_connector.client[db_name]
            logger.info(f"✅ (Connector) Successfully connected to MongoDB: {db_name}")
    except Exception as e:
        logger.error(f"❌ (Connector) Failed to connect to MongoDB: {e}")
        raise

def get_collection(collection_name: str):
    """Provides access to a specific collection in the database."""
    if db_connector.db is None:
        # This provides a fallback for simple script runs, but init_db_connection is preferred
        init_db_connection()
    return db_connector.db[collection_name]

def close_db_connection():
    """Closes the MongoDB connection."""
    if db_connector.client:
        db_connector.client.close()
        logger.info("✅ (Connector) MongoDB connection closed.")