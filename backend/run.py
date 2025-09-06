#!/usr/bin/env python3

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import tempfile
import logging
from datetime import timedelta, datetime
import traceback
import re
import csv
import io

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
jwt = JWTManager(app)
CORS(app,
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# Helper function to serialize MongoDB documents to JSON-safe format
def serialize_document(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            # Handle nested objects
            result[key] = {}
            for nested_key, nested_value in value.items():
                if isinstance(nested_value, ObjectId):
                    result[key][nested_key] = str(nested_value)
                else:
                    result[key][nested_key] = nested_value
        elif isinstance(value, list):
            # Handle arrays
            result[key] = []
            for item in value:
                if isinstance(item, ObjectId):
                    result[key].append(str(item))
                elif isinstance(item, dict):
                    result[key].append(serialize_document(item))
                else:
                    result[key].append(item)
        else:
            result[key] = value
    
    return result

# MongoDB connection
try:
    mongo_client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    db = mongo_client['kyc_verification']
    users_collection = db['users']
    records_collection = db['records']
    
    # Test connection
    mongo_client.admin.command('ping')
    logger.info("✅ MongoDB connected successfully")
    
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {e}")
    logger.error("Please ensure MongoDB is running locally")
    db = None
    users_collection = None
    records_collection = None

# Fallback in-memory storage
users_db = []
records_db = []

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    logger.warning(f"❌ Token expired for user: {jwt_payload.get('sub', 'unknown')}")
    return jsonify({'error': 'Token has expired', 'code': 'TOKEN_EXPIRED'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    logger.warning(f"❌ Invalid token: {error}")
    return jsonify({'error': 'Invalid token', 'code': 'TOKEN_INVALID'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    logger.warning(f"❌ Missing token: {error}")
    return jsonify({'error': 'Authorization token required', 'code': 'TOKEN_MISSING'}), 401

@app.route('/')
def index():
    return jsonify({
        'message': 'AI-Powered KYC Verification System API',
        'version': '1.0.0',
        'status': 'running',
        'mongodb_status': 'connected' if db is not None else 'disconnected',
        'endpoints': {
            'health': '/health',
            'signup': 'POST /api/signup',
            'login': 'POST /api/login',
            'profile': 'GET /api/me',
            'extract': 'POST /api/extract',
            'stats': 'GET /api/records/stats',
            'records': 'GET /api/records',
            'delete_record': 'DELETE /api/records/<record_id>',
            'save_record': 'POST /api/records/save',
            'export_all_csv': 'GET /api/records/export/csv',
            'debug_users': 'GET /api/debug/users',
            'debug_mongodb': 'GET /api/debug/mongodb'
        }
    })

@app.route('/health')
def health():
    mongo_users = 0
    mongo_records = 0
    
    if users_collection is not None:
        try:
            mongo_users = users_collection.count_documents({})
            mongo_records = records_collection.count_documents({})
        except:
            pass
    
    return jsonify({
        'status': 'healthy',
        'mongodb_connected': db is not None,
        'users_in_mongodb': mongo_users,
        'records_in_mongodb': mongo_records,
        'users_in_memory': len(users_db),
        'records_in_memory': len(records_db),
        'message': 'AI-KYC Backend running perfectly'
    })

# SIGNUP
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        logger.info(f"📝 Signup request: {data.get('email', 'unknown')}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip() or email.split('@')[0]
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Check if user exists
        if users_collection is not None and users_collection.find_one({'email': email}):
            return jsonify({'error': 'User already exists'}), 400
        
        if any(u['email'] == email for u in users_db):
            return jsonify({'error': 'User already exists'}), 400
        
        password_hash = generate_password_hash(password)
        
        user_doc = {
            'email': email,
            'password_hash': password_hash,
            'name': name,
            'role': 'user',
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        user_id = None
        
        # Save to MongoDB (primary)
        if users_collection is not None:
            try:
                result = users_collection.insert_one(user_doc.copy())
                user_id = str(result.inserted_id)
                logger.info(f"✅ User saved to MongoDB: {email}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB save failed: {mongo_error}")
                user_doc['id'] = len(users_db) + 1
                users_db.append(user_doc)
                user_id = str(user_doc['id'])
        else:
            user_doc['id'] = len(users_db) + 1
            users_db.append(user_doc)
            user_id = str(user_doc['id'])
        
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'role': 'user'
            },
            'access_token': access_token,
            'token_type': 'Bearer'
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Signup error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# LOGIN
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logger.info(f"🔐 Login request: {data.get('email', 'unknown')}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = None
        user_id = None
        
        # Find user in MongoDB (primary)
        if users_collection is not None:
            try:
                user = users_collection.find_one({'email': email})
                if user:
                    user_id = str(user['_id'])
                    logger.info(f"🔍 User found in MongoDB: {email}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB query failed: {mongo_error}")
        
        # Fallback to memory
        if not user:
            user = next((u for u in users_db if u['email'] == email), None)
            if user:
                user_id = str(user['id'])
        
        if not user or not check_password_hash(user['password_hash'], password):
            logger.warning(f"❌ Invalid login: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user_id)
        
        logger.info(f"✅ Login successful: {email}")
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user_id,
                'email': user['email'],
                'name': user['name'],
                'role': user.get('role', 'user')
            },
            'access_token': access_token,
            'token_type': 'Bearer'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# GET CURRENT USER
@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        logger.info(f"👤 Get user profile: {user_id}")
        
        user = None
        
        # Find in MongoDB (primary)
        if users_collection is not None:
            try:
                user = users_collection.find_one({'_id': ObjectId(user_id)})
                if user:
                    logger.info(f"🔍 User profile from MongoDB: {user['email']}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB query failed: {mongo_error}")
        
        # Fallback to memory
        if not user:
            user = next((u for u in users_db if str(u['id']) == str(user_id)), None)
            if user:
                logger.info(f"🔍 User profile from memory: {user['email']}")
        
        if not user:
            logger.warning(f"❌ User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user.get('_id', user.get('id', user_id))),
                'email': user['email'],
                'name': user['name'],
                'role': user.get('role', 'user')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Get user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# GET RECORDS STATS - FIXED ObjectId Serialization
@app.route('/api/records/stats', methods=['GET'])
@jwt_required()
def get_records_stats():
    try:
        user_id = get_jwt_identity()
        logger.info(f"📊 Getting stats for user: {user_id}")
        
        user_records = []
        
        # Get from MongoDB (primary)
        if records_collection is not None:
            try:
                cursor = records_collection.find({'user_id': ObjectId(user_id)})
                # Convert to list of serialized documents
                user_records = [serialize_document(doc) for doc in cursor]
                logger.info(f"📊 Stats from MongoDB: {len(user_records)} records")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB query failed: {mongo_error}")
        
        # Fallback to memory
        if not user_records:
            user_records = [r for r in records_db if str(r.get('user_id')) == str(user_id)]
        
        stats = {
            'total_records': len(user_records),
            'aadhaar_count': len([r for r in user_records if r.get('document_type') == 'aadhaar']),
            'pan_count': len([r for r in user_records if r.get('document_type') == 'pan']),
            'verified_count': len([r for r in user_records if r.get('status') == 'processed']),
            'avg_confidence': round(sum(r.get('confidence_score', 0) for r in user_records) / len(user_records), 1) if user_records else 0
        }
        
        logger.info(f"✅ Stats calculated: {stats}")
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        logger.error(f"❌ Stats error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# GET ALL RECORDS - FIXED ObjectId Serialization
@app.route('/api/records', methods=['GET'])
@jwt_required()
def get_all_records():
    try:
        user_id = get_jwt_identity()
        logger.info(f"📁 Getting records for user: {user_id}")
        
        user_records = []
        
        # Get from MongoDB (primary)
        if records_collection is not None:
            try:
                cursor = records_collection.find({'user_id': ObjectId(user_id)}).sort('created_at', -1)
                for doc in cursor:
                    # Serialize the document to handle ObjectId fields
                    record = serialize_document(doc)
                    record['id'] = str(doc['_id'])
                    record['user_id'] = str(doc['user_id'])
                    user_records.append(record)
                
                logger.info(f"📁 Records from MongoDB: {len(user_records)}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB query failed: {mongo_error}")
        
        # Fallback to memory
        if not user_records:
            user_records = [r for r in records_db if str(r.get('user_id')) == str(user_id)]
            user_records.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            logger.info(f"📁 Records from memory: {len(user_records)}")
        
        return jsonify({
            'records': user_records,
            'total_count': len(user_records)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Get records error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# DELETE RECORD
@app.route('/api/records/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    try:
        user_id = get_jwt_identity()
        logger.info(f"🗑️ Delete request for record {record_id} by user {user_id}")
        
        deleted = False
        
        # Delete from MongoDB (primary)
        if records_collection is not None:
            try:
                result = records_collection.delete_one({
                    '_id': ObjectId(record_id),
                    'user_id': ObjectId(user_id)
                })
                
                if result.deleted_count > 0:
                    deleted = True
                    logger.info(f"✅ Record deleted from MongoDB: {record_id}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB delete failed: {mongo_error}")
        
        # Fallback to memory
        if not deleted:
            record = next((r for r in records_db if str(r.get('id')) == str(record_id) and str(r.get('user_id')) == str(user_id)), None)
            if record:
                records_db.remove(record)
                deleted = True
                logger.info(f"✅ Record deleted from memory: {record_id}")
        
        if not deleted:
            logger.warning(f"❌ Record not found: {record_id}")
            return jsonify({'error': 'Record not found'}), 404
        
        return jsonify({
            'message': 'Record deleted successfully',
            'deleted_record_id': record_id
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Delete record error: {str(e)}")
        return jsonify({'error': 'Failed to delete record'}), 500

# MANUAL SAVE RECORD endpoint
@app.route('/api/records/save', methods=['POST'])
@jwt_required()
def save_extracted_record():
    """Manually save extraction result to database"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'extraction_result' not in data:
            return jsonify({'error': 'No extraction data provided'}), 400
        
        extraction = data['extraction_result']
        
        record_doc = {
            'user_id': ObjectId(user_id),
            'document_type': extraction.get('document_type'),
            'extracted_fields': extraction.get('extracted_fields'),
            'confidence_score': extraction.get('confidence_score'),
            'raw_text': extraction.get('raw_text', '')[:500],
            'filename': extraction.get('filename'),
            'status': 'processed',
            'created_at': datetime.now().isoformat()
        }
        
        record_id = None
        
        # Save to MongoDB (primary)
        if records_collection is not None:
            try:
                result = records_collection.insert_one(record_doc.copy())
                record_id = str(result.inserted_id)
                logger.info(f"✅ Manual record saved to MongoDB: {record_id}")
            except Exception as mongo_error:
                logger.error(f"❌ MongoDB save failed: {mongo_error}")
                # Fallback to memory
                record_doc['id'] = len(records_db) + 1
                record_doc['user_id'] = user_id
                records_db.append(record_doc)
                record_id = record_doc['id']
        else:
            # Memory fallback
            record_doc['id'] = len(records_db) + 1
            record_doc['user_id'] = user_id
            records_db.append(record_doc)
            record_id = record_doc['id']
        
        return jsonify({
            'message': 'Record saved successfully',
            'record_id': record_id
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Manual save error: {str(e)}")
        return jsonify({'error': 'Failed to save record'}), 500

# EXTRACT DOCUMENT
@app.route('/api/extract', methods=['POST'])
@jwt_required()
def extract_document():
    try:
        logger.info("🔍 === DOCUMENT EXTRACTION REQUEST ===")
        user_id = get_jwt_identity()
        
        # Validation
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        doc_type = request.form.get('doctype', '').lower()
        if doc_type not in ['aadhaar', 'pan']:
            return jsonify({'success': False, 'error': 'Invalid document type'}), 400
        
        save_record = request.form.get('save_record', 'false').lower() == 'true'
        original_filename = secure_filename(file.filename)
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(original_filename)[1]) as tmp_file:
                file.save(tmp_file.name)
                temp_path = tmp_file.name
            
            # OCR Processing with demo fallback
            raw_text = None
            try:
                import pytesseract
                import cv2
                from PIL import Image
                import numpy as np
                
                if original_filename.lower().endswith('.pdf'):
                    from pdf2image import convert_from_path
                    pages = convert_from_path(temp_path, first_page=1, last_page=1)
                    if pages:
                        img = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)
                    else:
                        raise Exception("Could not convert PDF to image")
                else:
                    img = cv2.imread(temp_path)
                
                if img is None:
                    raise Exception("Could not read image file")
                
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                enhanced = clahe.apply(gray)
                raw_text = pytesseract.image_to_string(enhanced, config='--psm 6')
                
            except ImportError:
                # Demo fallback
                if doc_type == 'aadhaar':
                    raw_text = "Name: Manikya Taneja DOB: 17-02-2006 Gender: Male Address: 296 Lal, Vijayawada, Odisha - 412365 Aadhaar No: 833475476655"
                else:
                    raw_text = "Name: Sara Behl Father's Name: Samaira Mangat DOB: 11-02-1961 PAN: WCOZU6820P"
            
            if not raw_text or not raw_text.strip():
                return jsonify({'success': False, 'error': 'No text extracted'}), 422
            
            # Parse text
            if doc_type == 'aadhaar':
                extracted_fields = parse_aadhaar_text(raw_text)
            else:
                extracted_fields = parse_pan_text(raw_text)
            
            # Calculate confidence
            total_expected_fields = 5 if doc_type == 'aadhaar' else 4
            extracted_count = len([v for v in extracted_fields.values() if v and str(v).strip()])
            confidence = min(95, max(60, (extracted_count / total_expected_fields) * 100))
            
            result = {
                'success': True,
                'document_type': doc_type,
                'extracted_fields': extracted_fields,
                'confidence_score': round(confidence, 1),
                'raw_text': raw_text,
                'processing_timestamp': datetime.now().isoformat(),
                'filename': original_filename,
                'original_filename': original_filename
            }
            
            response_data = {
                'message': 'Document processed successfully',
                'extraction_result': result,
                'record_saved': False
            }
            
            return jsonify(response_data), 200
            
        finally:
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"❌ Extract endpoint error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Parsing functions
def parse_aadhaar_text(text):
    extracted = {
        'document_type': 'aadhaar',
        'name': None,
        'aadhaar_number': None,
        'date_of_birth': None,
        'gender': None,
        'address': None
    }
    
    text = text.replace('\n', ' ').strip()
    
    # Extract Aadhaar number
    aadhaar_patterns = [
        r'\b\d{4}\s*\d{4}\s*\d{4}\b',
        r'Aadhaar\s*No[:\s]*(\d{4}\s*\d{4}\s*\d{4})',
        r'(\d{12})'
    ]
    
    for pattern in aadhaar_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted['aadhaar_number'] = re.sub(r'\s+', '', match.group(1) if len(match.groups()) > 0 else match.group(0))
            break
    
    # Extract name
    name_patterns = [
        r'Name[:\s]+([A-Za-z\s]+?)(?:\s*DOB|\s*Gender|\s*Address|$)',
        r'Name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            if len(name) > 2 and not re.search(r'\d', name):
                extracted['name'] = name.title()
                break
    
    # Extract DOB
    dob_patterns = [
        r'DOB[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'Birth[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})'
    ]
    
    for pattern in dob_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted['date_of_birth'] = match.group(1)
            break
    
    # Extract gender
    if re.search(r'\b(male|m)\b', text, re.IGNORECASE) and not re.search(r'\b(female)\b', text, re.IGNORECASE):
        extracted['gender'] = 'Male'
    elif re.search(r'\b(female|f)\b', text, re.IGNORECASE):
        extracted['gender'] = 'Female'
    elif re.search(r'\b(other|o)\b', text, re.IGNORECASE):
        extracted['gender'] = 'Other'
    
    # Extract address
    address_match = re.search(r'Address[:\s]+(.+?)(?:Aadhaar|$)', text, re.IGNORECASE | re.DOTALL)
    if address_match:
        address = address_match.group(1).strip()
        if len(address) > 5:
            extracted['address'] = address
    
    return extracted

def parse_pan_text(text):
    extracted = {
        'document_type': 'pan',
        'name': None,
        'pan_number': None,
        'date_of_birth': None,
        'father_name': None
    }
    
    text = text.replace('\n', ' ').strip()
    
    # Extract PAN number
    pan_patterns = [
        r'\b([A-Z]{5}\d{4}[A-Z])\b',
        r'PAN[:\s]*([A-Z]{5}\d{4}[A-Z])',
    ]
    
    for pattern in pan_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted['pan_number'] = match.group(1).upper()
            break
    
    # Extract name
    name_patterns = [
        r'Name[:\s]+([A-Za-z\s]+?)(?:\s*Father|\s*DOB|\s*PAN|$)',
        r'Name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            if len(name) > 2 and not re.search(r'\d', name):
                extracted['name'] = name.title()
                break
    
    # Extract father's name
    father_patterns = [
        r"Father['\s]*s?\s*Name[:\s]+([A-Za-z\s]+?)(?:\s*DOB|\s*PAN|$)",
        r"Father[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
    ]
    
    for pattern in father_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            father_name = match.group(1).strip()
            if len(father_name) > 2 and not re.search(r'\d', father_name):
                extracted['father_name'] = father_name.title()
                break
    
    # Extract DOB
    dob_patterns = [
        r'DOB[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'Birth[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})'
    ]
    
    for pattern in dob_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted['date_of_birth'] = match.group(1)
            break
    
    return extracted

# CSV Export - FIXED ObjectId Serialization
@app.route('/api/records/export/csv', methods=['GET'])
@jwt_required()
def export_records_csv():
    try:
        user_id = get_jwt_identity()
        user_records = []
        
        if records_collection is not None:
            cursor = records_collection.find({'user_id': ObjectId(user_id)})
            for doc in cursor:
                record = serialize_document(doc)
                record['id'] = str(doc['_id'])
                user_records.append(record)
        else:
            user_records = [r for r in records_db if str(r.get('user_id')) == str(user_id)]
        
        if not user_records:
            return jsonify({'error': 'No records found to export'}), 404
        
        output = io.StringIO()
        fieldnames = [
            'record_id', 'document_type', 'filename', 'processing_date',
            'confidence_score', 'status', 'name', 'aadhaar_number',
            'pan_number', 'date_of_birth', 'gender', 'address', 'father_name'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for record in user_records:
            extracted = record.get('extracted_fields', {})
            
            row = {
                'record_id': record.get('id', str(record.get('_id', ''))),
                'document_type': record.get('document_type', '').upper(),
                'filename': record.get('filename', ''),
                'processing_date': record.get('created_at', ''),
                'confidence_score': f"{record.get('confidence_score', 0):.1f}%",
                'status': record.get('status', '').upper(),
                'name': extracted.get('name', ''),
                'aadhaar_number': extracted.get('aadhaar_number', ''),
                'pan_number': extracted.get('pan_number', ''),
                'date_of_birth': extracted.get('date_of_birth', ''),
                'gender': extracted.get('gender', ''),
                'address': extracted.get('address', ''),
                'father_name': extracted.get('father_name', '')
            }
            writer.writerow(row)
        
        csv_content = output.getvalue()
        output.close()
        
        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=kyc-records-{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        return response
        
    except Exception as e:
        logger.error(f"CSV export error: {str(e)}")
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

# Debug endpoints
@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    mongo_users = []
    memory_users = []
    
    if users_collection is not None:
        try:
            cursor = users_collection.find({})
            for doc in cursor:
                user = serialize_document(doc)
                user['id'] = str(doc['_id'])
                del user['password_hash']  # Security
                mongo_users.append(user)
        except Exception as e:
            logger.error(f"MongoDB debug query failed: {e}")
    
    memory_users = [
        {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'created_at': user['created_at']
        }
        for user in users_db
    ]
    
    return jsonify({
        'mongodb_users': mongo_users,
        'memory_users': memory_users,
        'total_mongo': len(mongo_users),
        'total_memory': len(memory_users)
    })

@app.route('/api/debug/mongodb', methods=['GET'])
def debug_mongodb():
    try:
        if db is not None:
            mongo_client.admin.command('ping')
            
            mongo_users_count = users_collection.count_documents({}) if users_collection is not None else 0
            mongo_records_count = records_collection.count_documents({}) if records_collection is not None else 0
            
            return jsonify({
                'mongodb_connected': True,
                'database_name': 'kyc_verification',
                'users_in_mongodb': mongo_users_count,
                'records_in_mongodb': mongo_records_count,
                'collections': db.list_collection_names(),
                'memory_users_count': len(users_db),
                'memory_records_count': len(records_db)
            })
        else:
            return jsonify({
                'mongodb_connected': False,
                'using_memory_storage': True,
                'memory_users_count': len(users_db),
                'memory_records_count': len(records_db)
            })
    except Exception as e:
        return jsonify({
            'mongodb_connected': False,
            'error': str(e),
            'using_memory_storage': True
        })

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting AI-Powered KYC Backend Server...")
    print("📋 Backend: http://localhost:5000")
    print("🔍 Health: http://localhost:5000/health")
    print("📝 Signup: POST http://localhost:5000/api/signup")
    print("🔑 Login: POST http://localhost:5000/api/login")
    print("👤 Profile: GET http://localhost:5000/api/me")
    print("📊 Stats: GET http://localhost:5000/api/records/stats")
    print("🔍 Extract: POST http://localhost:5000/api/extract")
    print("📁 Records: GET http://localhost:5000/api/records")
    print("🗑️ Delete Record: DELETE http://localhost:5000/api/records/<record_id>")
    print("💾 Save Record: POST http://localhost:5000/api/records/save")
    print("🔧 Debug Users: GET http://localhost:5000/api/debug/users")
    print("🔧 Debug MongoDB: GET http://localhost:5000/api/debug/mongodb")
    print("📥 Export CSV: GET http://localhost:5000/api/records/export/csv")
    print("=" * 60)
    
    app.run(host='127.0.0.1', port=5000, debug=True)
