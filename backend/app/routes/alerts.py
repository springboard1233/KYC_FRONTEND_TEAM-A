# routes/alerts.py
import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils.database import get_db

alerts_bp = Blueprint("alerts", __name__)
logger = logging.getLogger(__name__)

@alerts_bp.route("/alerts", methods=["GET"])
@jwt_required()
def get_alerts():
    """
    Fetch recent fraud/compliance alerts for the current user.
    """
    current_user_id = get_jwt_identity()
    try:
        db = get_db()
        # Fetch recent high/medium risk records as alerts
        alerts_cursor = db.records.find(
            {
                "user_id": current_user_id,
                "risk_category": {"$in": ["high", "medium"]}
            }
        ).sort("created_at", -1).limit(20)
        alerts = []
        for rec in alerts_cursor:
            alerts.append({
                "alert_type": "Fraud" if rec.get("risk_category") == "high" else "Compliance",
                "message": rec.get("fraud_analysis", {}).get("risk_factors", ["Suspicious activity"])[0],
                "risk": rec.get("risk_category"),
                "timestamp": rec.get("created_at"),
                "document_type": rec.get("document_type"),
                "fraud_score": rec.get("fraud_score"),
                "record_id": str(rec.get("_id")),
            })
        return jsonify(alerts=alerts), 200
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch alerts."}), 500