# FILE: backend/app/routes/audit.py
import logging
from flask import Blueprint, jsonify, request
from ..utils.database import get_db
from ..routes.admin import admin_required

audit_bp = Blueprint("audit", __name__)
logger = logging.getLogger(__name__)

@audit_bp.route("/audit-trail", methods=["GET"])
@admin_required
def get_audit_trail():
    """Fetch paginated audit trail records."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("limit", 20))
        skip = (page - 1) * per_page

        db = get_db()
        
        total_logs = db.audit_logs.count_documents({})
        logs_cursor = db.audit_logs.find().sort("timestamp", -1).skip(skip).limit(per_page)
        
        logs = []
        for log in logs_cursor:
            log["_id"] = str(log["_id"])
            logs.append(log)

        return jsonify({
            "logs": logs,
            "total": total_logs,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_logs + per_page - 1) // per_page,
        }), 200

    except Exception as e:
        logger.error(f"Error fetching audit trail: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch audit trail"}), 500