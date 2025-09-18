from flask import Blueprint, jsonify
from datetime import datetime
import sys
import os
from ..utils.database import db

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """System health check endpoint"""
    try:
        # Check database connection
        db_status = "connected" if db.db else "disconnected"
        
        # System information
        health_info = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'database': {
                'status': db_status,
                'type': 'MongoDB'
            },
            'system': {
                'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                'platform': sys.platform
            },
            'services': {
                'authentication': 'available',
                'ocr_processing': 'available',
                'file_upload': 'available'
            }
        }
        
        return jsonify(health_info), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

@health_bp.route('/health/db', methods=['GET'])
def database_health():
    """Database-specific health check"""
    try:
        # Test database connection
        if db.db:
            # Try to perform a simple operation
            result = db.db.command('ping')
            
            return jsonify({
                'status': 'healthy',
                'database': 'MongoDB',
                'connection': 'active',
                'ping_result': result,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'unhealthy',
                'database': 'MongoDB',
                'connection': 'inactive',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
            
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'MongoDB',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503
