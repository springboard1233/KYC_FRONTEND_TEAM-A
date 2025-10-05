# FILE: backend/app/routes/ocr.py

import os
import logging
import requests
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from ..models.record import EnhancedRecord
from ..utils.audit_logger import log_audit_event

ocr_bp = Blueprint("ocr", __name__)
logger = logging.getLogger(__name__)

def is_allowed_file(filename):
    """Checks if the file extension is allowed based on app config."""
    allowed_extensions = current_app.config.get("ALLOWED_EXTENSIONS", set())
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@ocr_bp.route("/extract", methods=["POST"])
@jwt_required()
def extract_document_info():
    """
    Handles file upload, calls the FastAPI service for AI analysis,
    and saves the complete verification results to the database.
    """
    current_user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    doc_type = request.form.get('doctype')
    user_entered_name = request.form.get('user_entered_name')

    if file.filename == '' or not doc_type or not user_entered_name:
        return jsonify({"error": "Missing file, document type, or user-entered name"}), 400

    if not is_allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    try:
        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, filename)
        
        os.makedirs(upload_folder, exist_ok=True)
        file.save(file_path)
        
        log_audit_event(current_user_id, "DOCUMENT_UPLOAD_SUCCESS", details={"filename": filename})

        fastapi_host = os.getenv("FASTAPI_HOST", "127.0.0.1")
        fastapi_port = os.getenv("FASTAPI_PORT", 8001)
        fastapi_url = f"http://{fastapi_host}:{fastapi_port}/verify_identity"
        
        logger.info(f"Forwarding request to AI service at {fastapi_url}")
        
        api_response = requests.post(fastapi_url, json={
            "file_path": file_path, "document_type": doc_type,
            "user_id": current_user_id, "user_entered_name": user_entered_name
        }, timeout=60)
        
        api_response.raise_for_status()
        analysis_data = api_response.json()
        logger.info(f"Received analysis from AI service: {analysis_data.get('status')}")

        # FIX: Extract all relevant nested data from the AI service response
        # to be saved in the database record. This makes the data available to the frontend.
        fraud_analysis = analysis_data.get('fraud_analysis', {})
        manipulation_result = fraud_analysis.get('analysis_details', {}).get('manipulation_result', {})
        
        full_record = EnhancedRecord(
            user_id=current_user_id,
            document_type=doc_type,
            filename=filename,
            user_entered_name=user_entered_name,
            status=analysis_data.get('status', 'pending'),
            extracted_fields=analysis_data.get('extracted_fields', {}),
            fraud_analysis=fraud_analysis,
            manipulation_result=manipulation_result, # Save manipulation data
            confidence_score=analysis_data.get('confidence_score', 0.0),
            fraud_score=fraud_analysis.get('fraud_score', 0.0),
            risk_category=fraud_analysis.get('risk_category', 'low'),
            risk_factors=fraud_analysis.get('risk_factors', []) # Save risk factors
        )
        full_record.save()
        logger.info(f"Successfully saved full analysis for record {full_record._id}")

        return jsonify({
            "success": True, 
            "message": "File processed successfully.",
            "extraction_result": full_record.to_dict()
        }), 201

    except requests.exceptions.RequestException as e:
        logger.error(f"Could not connect to AI service: {e}", exc_info=True)
        return jsonify({"error": "The AI verification service is currently unavailable. Please try again later."}), 503
    except Exception as e:
        logger.error(f"Error during file processing: {e}", exc_info=True)
        log_audit_event(current_user_id, "DOCUMENT_PROCESSING_FAILED", details={"error": str(e)})
        return jsonify({"error": "An internal error occurred during file processing."}), 500