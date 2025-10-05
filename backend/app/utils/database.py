import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from flask import g, current_app

logger = logging.getLogger(__name__)

def get_db():
    """
    Returns the database connection for the current application context.
    If a connection is not available, it creates one and stores it in 'g'.
    """
    if 'db' not in g:
        try:
            client = MongoClient(current_app.config['MONGO_URI'])
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            g.db = client.get_database()
            logger.info(f"✅ New MongoDB connection established for request.")
        except ConnectionFailure as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise RuntimeError("Database connection failed.") from e
        except Exception as e:
            logger.error(f"❌ An unexpected error occurred during DB connection: {e}")
            raise RuntimeError("An unexpected error occurred during DB connection.") from e
    return g.db

def close_db(e=None):
    """
    Closes the database connection at the end of the request.
    This function is registered to be called on app context teardown.
    """
    db_client = g.pop('db_client', None) # Legacy or direct client
    db_conn = g.pop('db', None)

    if db_conn is not None:
        try:
            db_conn.client.close()
            logger.info("✅ MongoDB connection closed for request.")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")
    elif db_client is not None:
        try:
            db_client.close()
            logger.info("✅ MongoDB client (legacy) closed for request.")
        except Exception as e:
            logger.error(f"Error closing legacy MongoDB client: {e}")


def init_app(app):
    """
    Initializes the database connection handling for the Flask app.
    - Registers the close_db function to be called on teardown.
    - Pings the database to confirm connection on startup.
    """
    app.teardown_appcontext(close_db)
    
    with app.app_context():
        try:
            # This will use the app context to establish a temporary connection
            # and confirm the database is reachable.
            get_db() 
            logger.info(f"✅ Connected to MongoDB: {app.config['MONGO_URI']}")
        except RuntimeError as e:
            logger.error(f"❌ Failed to connect to MongoDB on startup: {e}")
            logger.error("Ensure your MongoDB server is running and the MONGO_URI in your .env file is correct.")


def ping_db():
    """
    Pings the database to check for a successful connection.
    """
    try:
        db = get_db()
        db.command('ping')
        logger.info("✅ MongoDB ping successful.")
        return True
    except Exception as e:
        logger.error(f"❌ MongoDB ping failed: {e}")
        return False