import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
from functools import wraps

from ..models.record import EnhancedRecord
from ..models.user import User
from ..utils.database import get_db
from ..utils.audit_logger import log_audit_event

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)


# Secure admin decorator to protect admin-only endpoints
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Administration rights required"}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route("/queue", methods=["GET"])
@admin_required
def get_admin_queue():
    """Fetches all records with a 'pending' or 'flagged' status for admin review."""
    try:
        db = get_db()
        # Admins need to see both new submissions and previously flagged ones.
        pending_records_cursor = db.records.find(
            {"status": {"$in": ["pending", "flagged"]}}
        ).sort("created_at", -1)
        
        records = [EnhancedRecord(**rec).to_dict() for rec in pending_records_cursor]
        logger.info(f"Admin fetched review queue, found {len(records)} records.")
        return jsonify(records=records), 200
    except Exception as e:
        logger.error(f"Error fetching admin queue: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch admin queue."}), 500


@admin_bp.route("/record/<string:record_id>/decision", methods=["POST"])
@admin_required
def admin_decide_record(record_id):
    """
    Allows an admin to approve, reject, or flag a record.
    Saves the decision, comments, and audit trail information.
    """
    data = request.get_json()
    admin_user_id = get_jwt().get("sub")
    
    action = data.get("action")
    admin_comment = data.get("admin_comment", "") # Get admin comments from the request

    # FIX: Expanded actions to include 'flag' for more granular control.
    if action not in ["approve", "reject", "flag"]:
        return jsonify({"error": "Invalid action specified"}), 400

    try:
        obj_id = ObjectId(record_id)
    except Exception:
        return jsonify({"error": "Invalid record ID format"}), 400

    db = get_db()
    record = db.records.find_one({"_id": obj_id})
    if not record:
        return jsonify({"error": "Record not found"}), 404

    # FIX: Set a consistent status that matches frontend components.
    status_map = {
        "approve": "approved",
        "reject": "rejected",
        "flag": "flagged"
    }
    new_status = status_map.get(action)

    # REFACTOR: Create a comprehensive update object for atomicity.
    update_fields = {
        "status": new_status,
        "admin_comment": admin_comment,
        "reviewed_by": ObjectId(admin_user_id),
        "reviewed_at": datetime.utcnow()
    }

    # Update the primary record in the 'records' collection
    db.records.update_one({"_id": obj_id}, {"$set": update_fields})
    
    # Create or update an immutable copy in 'permanent_records' for audit purposes
    permanent_record_data = {**record, **update_fields}
    db.permanent_records.update_one(
        {"_id": obj_id}, 
        {"$set": permanent_record_data}, 
        upsert=True
    )
    
    log_audit_event(
        admin_user_id,
        f"RECORD_{action.upper()}",
        details={"record_id": record_id, "comment": admin_comment}
    )

    # Fetch the fully updated record to send back to the frontend
    updated_doc = db.records.find_one({"_id": obj_id})
    if updated_doc:
        return jsonify({"success": True, "record": EnhancedRecord(**updated_doc).to_dict()}), 200
    else:
        return jsonify({"error": "Record not found after update"}), 404


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


@admin_bp.route("/audit-trail", methods=["GET"])
@admin_required
def get_audit_trail():
    """Returns a paginated audit trail for the admin dashboard."""
    try:
        db = get_db()
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("limit", 15))
        skip = (page - 1) * per_page
        # Fetch audit logs, sorted by most recent
        audit_cursor = db.audit_logs.find().sort("timestamp", -1).skip(skip).limit(per_page)
        audit_list = []
        for log in audit_cursor:
            log["_id"] = str(log["_id"])
            if "user_id" in log:
                log["user_id"] = str(log["user_id"])
            audit_list.append(log)
        total = db.audit_logs.count_documents({})
        return jsonify({
            "audit_trail": audit_list,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200
    except Exception as e:
        logger.error(f"Error fetching audit trail: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch audit trail."}), 500