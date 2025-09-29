# FILE: backend/app/utils/audit_logger.py
import logging
from datetime import datetime
from flask import request
from .database import get_db

logger = logging.getLogger(__name__)

def log_audit_event(user_id: str, action: str, details: dict = None):
    """Logs a user action to the audit_logs collection."""
    try:
        db = get_db()
        log_entry = {
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "ip_address": request.remote_addr,
            "timestamp": datetime.utcnow(),
        }
        db.audit_logs.insert_one(log_entry)
    except Exception as e:
        logger.error(f"Failed to log audit event for user {user_id}, action {action}: {e}")