# FILE: backend/app/routes/admin.py
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId

from ..models.record import EnhancedRecord
from ..models.user import User
from ..utils.database import get_db
from ..utils.audit_logger import log_audit_event

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)


# Secure admin decorator
def admin_required(fn):
    from functools import wraps

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        user_role = claims.get("role")
        if user_role != "admin":
            return jsonify({"error": "Administration rights required"}), 403
        else:
            return fn(*args, **kwargs)

    return wrapper


@admin_bp.route("/queue", methods=["GET"])
@admin_required
def get_admin_queue():
    """
    Fetch all pending records for admin review.
    """
    try:
        # Fetch pending records and join with user info for context
        db = get_db()  # Assuming get_db returns a PyMongo database object
        pipeline = [
            {"$match": {"status": "pending"}},
            {"$sort": {"created_at": -1}},
            # Add more stages here if needed, e.g., to join with user data
        ]
        pending_records = list(db.records.aggregate(pipeline))
        records = [EnhancedRecord(**rec).to_dict() for rec in pending_records]
        logger.info(
            f"Admin fetched review queue, found {len(records)} pending records."
        )
        return jsonify(records=records), 200
    except Exception as e:
        logger.error(f"Error fetching admin queue: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch admin queue."}), 500


@admin_bp.route("/record/<string:record_id>/decision", methods=["POST"])
@admin_required
def admin_decide_record(record_id):
    """
    Approve or reject a record.
    """
    data = request.get_json()
    admin_user_id = get_jwt().get("sub")
    action = data.get("action")
    if action not in ["approve", "reject"]:
        return jsonify({"error": "Invalid action"}), 400
    try:
        db = get_db()
        try:
            obj_id = ObjectId(record_id)
        except Exception:
            return jsonify({"error": "Invalid record ID"}), 400
        record = db.records.find_one({"_id": obj_id})
        if not record:
            return jsonify({"error": "Record not found"}), 404

        # Set status for analytics/compliance
        new_status = "verified" if action == "approve" else "rejected"
        db.records.update_one({"_id": obj_id}, {"$set": {"status": new_status}})

        # Also update or insert into permanent_records for compliance/analytics
        record["status"] = new_status
        db.permanent_records.update_one(
            {"_id": record["_id"]}, {"$set": record}, upsert=True
        )

        # Optionally, update fraud_alerts for this record
        db.fraud_alerts.update_many(
            {"record_id": str(record["_id"])},
            {"$set": {"status": "resolved" if action == "approve" else "active"}},
        )
        
        # Log the admin decision
        log_audit_event(
            admin_user_id,
            f"RECORD_{action.upper()}",
            details={"record_id": record_id, "subject_user_id": str(record.get("user_id"))}
        )

        # Return updated record details by loading it through the model to ensure proper serialization
        updated_doc = db.records.find_one({"_id": obj_id})
        if updated_doc:
            return jsonify({"success": True, "record": EnhancedRecord(**updated_doc).to_dict()}), 200
        else:
            return jsonify({"error": "Record not found after update"}), 404
    except Exception as e:
        logger.error(f"Error updating record status: {e}", exc_info=True)
        return jsonify({"error": str(e) or "Failed to update record status."}), 500


@admin_bp.route("/records/export", methods=["GET"])
@admin_required
def export_records():
    """Exports all records to for CSV download."""
    try:
        all_records = EnhancedRecord.get_all()
        records_list = [r.to_dict() for r in all_records]
        log_audit_event(get_jwt().get("sub"), "RECORDS_EXPORT")
        return jsonify(records=records_list), 200
    except Exception as e:
        logger.error(f"Error exporting records: {e}", exc_info=True)
        return jsonify({"error": "Failed to export records."}), 500


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    """Fetch and paginate users for the admin panel."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search_query = request.args.get("search", "")
        role_filter = request.args.get("role", "")

        query = {}
        if search_query:
            query["$or"] = [
                {"name": {"$regex": search_query, "$options": "i"}},
                {"email": {"$regex": search_query, "$options": "i"}},
            ]
        if role_filter:
            query["role"] = role_filter

        users_cursor = User.get_all(query, page, per_page)
        users_list = [user.to_dict() for user in users_cursor]
        total_users = User.get_count(query)

        return jsonify(
            {
                "users": users_list,
                "total": total_users,
                "page": page,
                "per_page": per_page,
                "total_pages": (total_users + per_page - 1) // per_page,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching users: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch users"}), 500


@admin_bp.route("/users/<string:user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id):
    """Update a user's role."""
    data = request.get_json()
    new_role = data.get("role")
    if not new_role or new_role not in ["user", "admin"]:
        return jsonify({"error": "Invalid role specified"}), 400

    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.role = new_role
    user.save()
    return jsonify(user.to_dict()), 200