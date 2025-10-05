import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'a_very_secret_key')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/kyc_database')
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/kyc_database_dev')

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    MONGO_URI = os.getenv('MONGO_TEST_URI', 'mongodb://localhost:27017/kyc_database_test')
    WTF_CSRF_ENABLED = False # Disable CSRF forms in testing

class ProductionConfig(Config):
    """Production configuration."""
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/kyc_database_prod')

# Dictionary to map config names to their respective classes
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config(config_name):
    """
    Returns the configuration object for the given config name.
    """
    return config.get(config_name, config['default'])