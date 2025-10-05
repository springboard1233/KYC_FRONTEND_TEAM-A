# backend/db_connector.py

import os
import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database


# Configure logger
logger = logging.getLogger(__name__)


class DBConnector:
    """A singleton-like class to hold the MongoDB client and database instances."""
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None


db_connector = DBConnector()


def init_db_connection() -> None:
    """
    Initializes the database connection using environment variables.
    Pings the database to verify the connection is active.
    Raises:
        Exception: If the connection to MongoDB cannot be established.
    """
    try:
        if db_connector.client is not None:
            logger.debug("MongoDB client already initialized. Skipping re-initialization.")
            return
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        db_name = os.getenv("MONGO_DB_NAME", "kyc_database")
        logger.info(f"Attempting to connect to MongoDB at {mongo_uri}...")
        db_connector.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db_connector.client.admin.command("ping")  # Test connection
        db_connector.db = db_connector.client[db_name]
        logger.info(f"✅ (Connector) Successfully connected to MongoDB: {db_name}")
    except Exception as e:
        logger.error(f"❌ (Connector) Failed to connect to MongoDB: {e}")
        raise


def get_collection(collection_name: str):
    """
    Provides access to a specific collection in the database.
    Args:
        collection_name: The name of the collection to retrieve.
    Returns:
        A PyMongo Collection object.
    Raises:
        RuntimeError: If the database has not been initialized.
    """
    if db_connector.db is None:
        raise RuntimeError("Database connection has not been initialized. Call init_db_connection() first.")
    return db_connector.db[collection_name]


def close_db_connection() -> None:
    """Closes the MongoDB client connection if it is open."""
    if db_connector.client:
        db_connector.client.close()
        db_connector.client = None
        db_connector.db = None
        logger.info("✅ (Connector) MongoDB connection closed.")