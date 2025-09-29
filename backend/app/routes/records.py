# FILE: backend/app/routes/records.py
import logging
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from bson import ObjectId
from ..models.record import EnhancedRecord
from ..utils.database import get_db

records_bp = Blueprint("records", __name__)
logger = logging.getLogger(__name__)

@records_bp.route("/records", methods=["GET"])
@jwt_required()
def get_records():
    """
    Fetches all records (pending and permanent) for the currently logged-in user.
    """
    try:
        claims = get_jwt()
        is_admin = claims.get("role") == "admin"
        
        if is_admin:
            # Admins get all records
            records = EnhancedRecord.get_all()
        else:
            # Regular users get only their own records
            current_user_id = get_jwt_identity()
            records = EnhancedRecord.get_by_user(current_user_id)

        records_list = [r.to_dict() for r in records]
        logger.info(f"Fetched {len(records_list)} records for user {get_jwt_identity()} (admin={is_admin}).")
        return jsonify(records=records_list), 200
    except Exception as e:
        logger.error(f"Error fetching records for user {get_jwt_identity()}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve records."}), 500

@records_bp.route("/records/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """
    Calculates and returns dashboard statistics for the currently logged-in user.
    """
    try:
        claims = get_jwt()
        is_admin = claims.get("role") == "admin"

        if is_admin:
            user_records = EnhancedRecord.get_all()
        else:
            current_user_id = get_jwt_identity()
            user_records = EnhancedRecord.get_by_user(current_user_id)

        stats = {
            "total_records": len(user_records),
            "verified_count": len([r for r in user_records if r.status == "approve"]),
            "high_risk_count": len([r for r in user_records if r.risk_category == "high"]),
            "medium_risk_count": len([r for r in user_records if r.risk_category == "medium"]),
            "low_risk_count": len([r for r in user_records if r.risk_category == "low"]),
            "aadhaar_count": len([r for r in user_records if r.document_type == "aadhaar"]),
            "pan_count": len([r for r in user_records if r.document_type == "pan"]),
            "avg_confidence": (
                sum([r.confidence_score for r in user_records]) / len(user_records)
                if user_records else 0
            ),
            "verification_success_rate": (
                len([r for r in user_records if r.status == "approve"]) / len(user_records) * 100
                if user_records else 0
            ),
            "fraud_detection_rate": (
                len([r for r in user_records if r.risk_category == "high"]) / len(user_records) * 100
                if user_records else 0
            ),
            "avg_fraud_score": (
                sum([r.fraud_score for r in user_records]) / len(user_records)
                if user_records else 0
            ),
        }
        return jsonify(stats=stats), 200
    except Exception as e:
        logger.error(f"Error calculating stats for user {get_jwt_identity()}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve stats."}), 500

@records_bp.route("/records/<record_id>", methods=["GET"])
@jwt_required()
def get_record_by_id(record_id):
    """
    Fetch a single record by its ID for the current user.
    """
    current_user_id = get_jwt_identity()
    try:
        record = EnhancedRecord.get_by_id(record_id)
        if not record or str(record.user_id) != str(current_user_id):
            return jsonify({"error": "Record not found."}), 404
        return jsonify(record=record.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching record {record_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve record."}), 500

@records_bp.route("/records/<record_id>", methods=["DELETE"])
@jwt_required()
def delete_record(record_id):
    """
    Delete a record by its ID for the current user.
    """
    current_user_id = get_jwt_identity()
    try:
        record = EnhancedRecord.get_by_id(record_id)
        if not record or str(record.user_id) != str(current_user_id):
            return jsonify({"error": "Record not found."}), 404
        db = get_db()
        db.records.delete_one({"_id": record._id})
        return jsonify({"success": True}), 200
    except Exception as e:
        logger.error(f"Error deleting record {record_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete record."}), 500

@records_bp.route("/records/<record_id>/submit-review", methods=["POST"])
@jwt_required()
def submit_for_review(record_id):
    """
    Allows a user to reset a record's status to 'pending' for re-review.
    """
    current_user_id = get_jwt_identity()
    try:
        record = EnhancedRecord.get_by_id(record_id)
        
        if not record or str(record.user_id) != str(current_user_id):
            return jsonify({"error": "Record not found or access denied."}), 404
        
        # Update status to pending
        db = get_db()
        db.records.update_one({"_id": ObjectId(record_id)}, {"$set": {"status": "pending"}})
        return jsonify({"success": True, "message": "Record submitted for review."}), 200
    except Exception as e:
        logger.error(f"Error submitting record {record_id} for review: {e}", exc_info=True)
        return jsonify({"error": "Failed to submit for review."}), 500