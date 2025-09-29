import os
import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import hashlib
import requests

from ..models.record import EnhancedRecord
from ..utils.audit_logger import log_audit_event

# Get Compliance service URL from environment
COMPLIANCE_SERVICE_URL = os.getenv("COMPLIANCE_SERVICE_URL", "http://127.0.0.1:8001")

ocr_bp = Blueprint("ocr", __name__)
logger = logging.getLogger(__name__)

def is_allowed_file(filename):
    """Check if the file has an allowed extension."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in current_app.config["ALLOWED_EXTENSIONS"]
    )


@ocr_bp.route("/extract", methods=["POST"])
@jwt_required()
def extract_and_process():
    """
    Main endpoint for document upload, OCR, and fraud analysis.
    """
    if "file" not in request.files:
        return jsonify(error="No file part in the request"), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify(error="No file selected for uploading"), 400

    if not is_allowed_file(file.filename):
        return jsonify(error="File type not allowed"), 400

    try:
        # Securely save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        logger.info(f"File saved to {filepath}")

        # Get data from form
        user_id = get_jwt_identity()
        # Ensure user_id is ObjectId for DB
        from bson.objectid import ObjectId
        user_id_obj = ObjectId(user_id)
        document_type = request.form.get("doctype", "aadhaar")
        user_entered_name = request.form.get("user_entered_name", "")
        
        # 1. Call the centralized Compliance Service for all processing

        try:
            compliance_payload = {
                "file_path": filepath,
                "document_type": document_type,
                "user_id": user_id,
                "user_entered_name": user_entered_name,
            }
            compliance_res = requests.post(
                f"{COMPLIANCE_SERVICE_URL}/verify_identity",
                json=compliance_payload
            )
            
            # Pass through non-200 responses directly to the frontend
            if compliance_res.status_code != 200:
                try:
                    error_data = compliance_res.json()
                    # FastAPI uses "detail" for its HTTPException messages
                    error_message = error_data.get("detail", "An unknown error occurred in the compliance service.")
                except Exception:
                    error_message = f"Compliance service returned a non-JSON error: {compliance_res.text}"
                logger.error(f"Compliance service failed with status {compliance_res.status_code}: {error_message}")
                return jsonify(error=error_message), compliance_res.status_code
            
            try:
                compliance_data = compliance_res.json()
            except Exception:
                logger.error(f"Compliance service did not return valid JSON: {compliance_res.text}")
                return jsonify(error="Compliance service did not return valid JSON."), 502

        except requests.exceptions.RequestException as e:
            logger.error(f"Compliance service call failed: {e}")
            return jsonify(error="Compliance service is unavailable"), 503
        
        # 2. Save the final record from the compliance service result
        file.seek(0) # Reset file stream to read for hashing
        fraud_analysis = compliance_data.get("fraud_analysis", {})
        record = EnhancedRecord(
            user_id=user_id_obj,
            document_type=document_type,
            filename=filename,
            user_entered_name=user_entered_name,
            extracted_fields=compliance_data.get("extracted_fields", {}),
            confidence_score=compliance_data.get("confidence_score", 0.0),
            doc_hash=hashlib.sha256(file.read()).hexdigest(),
            fraud_analysis=fraud_analysis,
            manipulation_result=fraud_analysis.get("analysis_details", {}).get("manipulation_result", {}),
            fraud_score=fraud_analysis.get("fraud_score", 0.0),
            risk_category=fraud_analysis.get("risk_category", "low"),
            risk_factors=fraud_analysis.get("risk_factors", []),
            status="pending",
        )
        record_id = record.save()
        logger.info(f"Record saved with ID: {record_id}")
        log_audit_event(
            user_id,
            "DOCUMENT_UPLOAD_SUCCESS",
            details={"record_id": str(record_id), "filename": filename, "document_type": document_type}
        )

        return jsonify({
            "success": True,
            "extraction_result": record.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error in extract_and_process: {str(e)}", exc_info=True)
        return jsonify(error="An unexpected error occurred during processing"), 500