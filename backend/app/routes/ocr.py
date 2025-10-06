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
        
        # --- PATCH: Run document integrity analysis directly ---
        from ..utils.advanced_fraud_detection import AdvancedFraudDetector
        detector = AdvancedFraudDetector()
        manipulation_result = detector.detect_document_authenticity(file_path, doc_type)

        # Simulate fraud_analysis structure for compatibility
        fraud_analysis = {
            "fraud_score": manipulation_result.get("manipulation_score", 0.0),
            "risk_category": manipulation_result.get("risk_level", "low"),
            "risk_factors": manipulation_result.get("detected_issues", []),
            "ai_confidence": manipulation_result.get("confidence", 0.0),
            "ai_insights": manipulation_result.get("ai_insights", []),
            "analysis_details": {
                "manipulation_result": manipulation_result
            }
        }

        # You may still want to run OCR extraction for fields
        from ..utils.ocr import OCRProcessor
        ocr = OCRProcessor()
        ocr_result = ocr.process_document(file_path, doc_type)

        # Document hash for duplicate detection
        doc_hash = ocr_result.get('document_hash', None)
        duplicate_check = {}
        if doc_hash:
            from ..utils.database import get_db
            db = get_db()
            duplicate = db.records.find_one({"doc_hash": doc_hash})
            if duplicate:
                duplicate_check = {"is_duplicate": True, "duplicate_id": str(duplicate.get('_id'))}
            else:
                duplicate_check = {"is_duplicate": False}

        # AI name matching using actual extracted fields
        from ..utils.advanced_fraud_detection import AdvancedFraudDetector
        detector = AdvancedFraudDetector()
        analysis = detector.analyze_document(
            image_path=file_path,
            extracted_fields=ocr_result.get('extracted_fields', {}),
            user_entered_name=user_entered_name,
            document_type=doc_type,
            user_id=current_user_id
        )

        # Force status to 'pending' for all new submissions
        full_record = EnhancedRecord(
            user_id=current_user_id,
            document_type=doc_type,
            filename=filename,
            user_entered_name=user_entered_name,
            status='pending',
            extracted_fields=ocr_result.get('extracted_fields', {}),
            fraud_analysis=analysis.get('fraud_analysis', {}),
            manipulation_result=analysis.get('manipulation_result', {}),
            confidence_score=ocr_result.get('confidence_score', 0.0),
            fraud_score=analysis.get('fraud_analysis', {}).get('fraud_score', 0.0),
            risk_category=analysis.get('fraud_analysis', {}).get('risk_category', 'low'),
            risk_factors=analysis.get('fraud_analysis', {}).get('risk_factors', []),
            doc_hash=doc_hash,
            duplicate_check=duplicate_check
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