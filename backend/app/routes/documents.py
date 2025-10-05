import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..utils.database import get_db
from ..utils.helpers import bson_to_json

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    """Checks if a file's extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    """
    Handles document uploads from users.
    Expects a multipart form with 'file' and 'doc_type'.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    doc_type = request.form.get('doc_type')

    if not doc_type or doc_type not in ['aadhaar', 'pan']:
        return jsonify({"error": "A valid document type (aadhaar, pan) is required"}), 400

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        
        # Use absolute path for uploads to avoid ambiguity
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if not os.path.isabs(upload_folder):
             upload_folder = os.path.join(current_app.instance_path, upload_folder)

        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        db = get_db()
        current_user_id = get_jwt_identity()
        document_record = {
            "user_id": current_user_id,
            "doc_type": doc_type,
            "filename": filename,
            "filepath": filepath,
            "status": "uploaded",
            "uploaded_at": datetime.utcnow(),
            "ocr_data": None,
            "fraud_score": None,
            "verification_status": "pending"
        }
        result = db.documents.insert_one(document_record)
        return jsonify({
            "message": "File uploaded successfully. Verification is pending.",
            "document_id": str(result.inserted_id)
        }), 201

    return jsonify({"error": "File type not allowed"}), 400

@documents_bp.route('/status', methods=['GET'])
@jwt_required()
def get_user_documents():
    """Fetches all documents and their statuses for the current user."""
    db = get_db()
    current_user_id = get_jwt_identity()
    documents = db.documents.find({"user_id": current_user_id})
    result = [bson_to_json(doc) for doc in documents]
    return jsonify(result), 200

@documents_bp.route('/<document_id>', methods=['GET'])
@jwt_required()
def get_document_details(document_id):
    """Fetches details for a specific document."""
    db = get_db()
    current_user_id = get_jwt_identity()
    try:
        doc_oid = ObjectId(document_id)
    except Exception:
        return jsonify({"error": "Invalid document ID format"}), 400

    document = db.documents.find_one({"_id": doc_oid, "user_id": current_user_id})
    if not document:
        return jsonify({"error": "Document not found or access denied"}), 404
    return jsonify(bson_to_json(document)), 200