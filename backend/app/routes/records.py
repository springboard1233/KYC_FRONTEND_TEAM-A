# FILE: backend/app/routes/records.py
import logging
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId

# Local application imports
from ..models.record import EnhancedRecord
from ..utils.database import get_db

records_bp = Blueprint("records", __name__)
logger = logging.getLogger(__name__)

def serialize_record(record):
    """Helper function to convert a MongoDB record document to a JSON-serializable dict."""
    if isinstance(record, EnhancedRecord):
        # If it's already a model instance, use its to_dict method
        return record.to_dict()
    
    # Handle raw PyMongo documents
    # Convert all ObjectId fields to strings
    for k, v in record.items():
        if isinstance(v, ObjectId):
            record[k] = str(v)
    if record.get("created_at"):
        record["created_at"] = record["created_at"].isoformat()
    if record.get("updated_at"):
        record["updated_at"] = record["updated_at"].isoformat()
    # Ensure admin_comment and decision are always present
    record["admin_comment"] = record.get("admin_comment", "")
    # Decision is now mapped from status for user clarity
    status_map = {"approved": "approve", "rejected": "reject", "flagged": "flag"}
    record["decision"] = status_map.get(record.get("status"), "")
    # Ensure document integrity analysis fields are present and per-document
    record["manipulation_result"] = record.get("manipulation_result", {})
    record["duplicate_check"] = record.get("duplicate_check", {})
    record["doc_hash"] = record.get("doc_hash", "")
    record["processing_details"] = record.get("processing_details", {})
    return record

@records_bp.route("/records", methods=["GET"])
@jwt_required()
def get_records():
    """
    Fetches records. For users, it gets their own records.
    PERF_FIX: For admins, it now uses pagination to fetch all records efficiently.
    """
    try:
        claims = get_jwt()
        is_admin = claims.get("role") == "admin"
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('limit', 10))
        skip = (page - 1) * per_page
        
        db = get_db()
        records_cursor = None
        total_count = 0
        
        if is_admin:
            # For admins, query all records with pagination
            records_cursor = db.records.find().sort("created_at", -1).skip(skip).limit(per_page)
            total_count = db.records.count_documents({})
        else:
            # For regular users, get only their own records
            current_user_id = get_jwt_identity()
            query = {"user_id": ObjectId(current_user_id)}
            records_cursor = db.records.find(query).sort("created_at", -1).skip(skip).limit(per_page)
            total_count = db.records.count_documents(query)

        # Only allow records to be marked as approved/rejected/flagged if reviewed by admin
        records_list = []
        for r in records_cursor:
            # Prevent auto-approval/rejection: Only allow status change if reviewed_by and reviewed_at are set
            if r.get("status") in ["approved", "rejected", "flagged"]:
                if not r.get("reviewed_by") or not r.get("reviewed_at"):
                    r["status"] = "pending"
            records_list.append(serialize_record(r))
        total_pages = (total_count + per_page - 1) // per_page
        
        logger.info(f"Fetched {len(records_list)} records for user {get_jwt_identity()} (admin={is_admin}).")
        
        return jsonify(
            records=records_list,
            total_count=total_count,
            total_pages=total_pages,
            page=page
        ), 200

    except Exception as e:
        logger.error(f"Error fetching records: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve records."}), 500


@records_bp.route("/records/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """
    Calculates and returns dashboard statistics.
    PERF_FIX: For admins, this now processes records directly from the DB cursor,
    avoiding creating thousands of Python objects in memory.
    """
    try:
        claims = get_jwt()
        is_admin = claims.get("role") == "admin"
        db = get_db()
        
        query = {}
        if not is_admin:
            current_user_id = get_jwt_identity()
            query = {"user_id": ObjectId(current_user_id)}
            
        # Efficiently fetch all records for stats calculation
        user_records_cursor = db.records.find(query)
        
        # Process records directly from cursor to avoid high memory usage
        stats_data = {
            "total_records": 0, "verified_count": 0, "high_risk_count": 0,
            "medium_risk_count": 0, "low_risk_count": 0, "aadhaar_count": 0,
            "pan_count": 0, "confidence_sum": 0, "fraud_score_sum": 0
        }

        for r in user_records_cursor:
            stats_data["total_records"] += 1
            if r.get("status") in ["approve", "verified"]: stats_data["verified_count"] += 1
            if r.get("risk_category") == "high": stats_data["high_risk_count"] += 1
            if r.get("risk_category") == "medium": stats_data["medium_risk_count"] += 1
            if r.get("risk_category") == "low": stats_data["low_risk_count"] += 1
            if r.get("document_type") == "aadhaar": stats_data["aadhaar_count"] += 1
            if r.get("document_type") == "pan": stats_data["pan_count"] += 1
            stats_data["confidence_sum"] += r.get("confidence_score", 0)
            stats_data["fraud_score_sum"] += r.get("fraud_score", 0)

        total = stats_data["total_records"]
        final_stats = {
            **stats_data,
            "avg_confidence": (stats_data["confidence_sum"] / total) if total > 0 else 0,
            "verification_success_rate": (stats_data["verified_count"] / total * 100) if total > 0 else 0,
            "fraud_detection_rate": (stats_data["high_risk_count"] / total * 100) if total > 0 else 0,
            "avg_fraud_score": (stats_data["fraud_score_sum"] / total) if total > 0 else 0,
        }
        # Remove sum fields
        del final_stats["confidence_sum"]
        del final_stats["fraud_score_sum"]

        return jsonify(stats=final_stats), 200
        
    except Exception as e:
        logger.error(f"Error calculating stats: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve stats."}), 500
@records_bp.route("/records/<record_id>", methods=["DELETE"])
@jwt_required()
def delete_record(record_id):
    """
    Deletes a record by its ID. Users can delete their own records; admins can delete any record.
    """
    try:
        claims = get_jwt()
        is_admin = claims.get("role") == "admin"
        current_user_id = get_jwt_identity()
        db = get_db()
        record = db.records.find_one({"_id": ObjectId(record_id)})
        if not record:
            return jsonify({"error": "Record not found."}), 404
        # Only allow if admin or owner
        if not is_admin and str(record.get("user_id")) != str(current_user_id):
            return jsonify({"error": "Unauthorized to delete this record."}), 403
        db.records.delete_one({"_id": ObjectId(record_id)})
        logger.info(f"Record {record_id} deleted by user {current_user_id} (admin={is_admin})")
        return jsonify({"success": True, "message": "Record deleted successfully."}), 200
    except Exception as e:
        logger.error(f"Error deleting record {record_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete record."}), 500