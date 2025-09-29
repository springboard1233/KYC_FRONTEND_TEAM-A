# backend/app/routes/compliance.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db

compliance_bp = Blueprint("compliance", __name__, url_prefix="/api-compliance")


def get_stats_from_db():
    db = get_db()
    total_users = db.users.count_documents({})
    total_records = db.records.count_documents({})
    # For alerts, use a dedicated collection if available, else fallback to records
    fraud_alerts_col = (
        db["fraud_alerts"] if "fraud_alerts" in db.list_collection_names() else None
    )
    total_alerts = (
        fraud_alerts_col.count_documents({})
        if fraud_alerts_col
        else db.records.count_documents({"risk_category": {"$in": ["high", "medium"]}})
    )
    active_alerts = (
        fraud_alerts_col.count_documents({"status": "active"})
        if fraud_alerts_col
        else db.records.count_documents(
            {
                "risk_category": {"$in": ["high", "medium"]},
                "alert_resolved": {"$ne": True},
            }
        )
    )
    # Severity breakdown
    severity_levels = ["low", "medium", "high", "critical"]
    severity_breakdown = {}
    for sev in severity_levels:
        if fraud_alerts_col:
            severity_breakdown[sev] = fraud_alerts_col.count_documents(
                {"severity": sev}
            )
        else:
            severity_breakdown[sev] = db.records.count_documents({"risk_category": sev})
    # Recent alerts (last 24h)
    from datetime import datetime, timedelta

    yesterday = datetime.utcnow() - timedelta(days=1)
    if fraud_alerts_col:
        recent_alerts_24h = fraud_alerts_col.count_documents(
            {"created_at": {"$gte": yesterday}}
        )
    else:
        recent_alerts_24h = db.records.count_documents(
            {
                "created_at": {"$gte": yesterday},
                "risk_category": {"$in": ["high", "medium"]},
            }
        )
    # Compliance score: 100 - (active_alerts / total_records) * 100
    compliance_score = max(0, 100 - (active_alerts / max(total_records, 1)) * 100)
    return {
        "total_users": total_users,
        "total_records": total_records,
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "severity_breakdown": severity_breakdown,
        "recent_alerts_24h": recent_alerts_24h,
        "compliance_score": compliance_score,
    }


@compliance_bp.route("/compliance-stats", methods=["GET"])
@jwt_required()
def compliance_stats():
    stats = get_stats_from_db()
    return jsonify(stats), 200


@compliance_bp.route("/alerts", methods=["GET"])
@jwt_required()
def compliance_alerts():
    db = get_db()
    # Return all active alerts (not just for current user)
    fraud_alerts_col = (
        db["fraud_alerts"] if "fraud_alerts" in db.list_collection_names() else None
    )
    if fraud_alerts_col:
        alerts_cursor = (
            fraud_alerts_col.find({"status": "active"}).sort("created_at", -1).limit(50)
        )
        alerts = []
        for alert in alerts_cursor:
            alerts.append(
                {
                    "alert_id": alert.get("alert_id", str(alert.get("_id"))),
                    "record_id": alert.get("record_id"),
                    "alert_type": alert.get("alert_type", "Fraud"),
                    "severity": alert.get("severity", "high"),
                    "message": alert.get("message", "Suspicious activity"),
                    "confidence_score": alert.get("confidence_score", 1.0),
                    "timestamp": alert.get("created_at"),
                    "document_type": alert.get("document_type", "unknown"),
                    "fraud_score": alert.get("fraud_score", 1.0),
                }
            )
    else:
        # Fallback: use high/medium risk records as alerts
        alerts_cursor = (
            db.records.find(
                {
                    "risk_category": {"$in": ["high", "medium"]},
                    "alert_resolved": {"$ne": True},
                }
            )
            .sort("created_at", -1)
            .limit(50)
        )
        alerts = []
        for rec in alerts_cursor:
            alerts.append(
                {
                    "alert_id": str(rec.get("_id")),
                    "record_id": str(rec.get("_id")),
                    "alert_type": "Fraud"
                    if rec.get("risk_category") == "high"
                    else "Compliance",
                    "severity": rec.get("risk_category", "high"),
                    "message": rec.get("fraud_analysis", {}).get(
                        "risk_factors", ["Suspicious activity"]
                    )[0],
                    "confidence_score": rec.get("fraud_score", 1.0),
                    "timestamp": rec.get("created_at"),
                    "document_type": rec.get("document_type", "unknown"),
                    "fraud_score": rec.get("fraud_score", 1.0),
                }
            )
    return jsonify(alerts=alerts), 200


@compliance_bp.route("/alerts/<alert_id>/resolve", methods=["POST"])
@jwt_required()
def resolve_alert(alert_id):
    db = get_db()
    resolution_notes = request.json.get("resolution_notes", "")
    result = db.records.update_one(
        {"_id": alert_id},
        {"$set": {"alert_resolved": True, "resolution_notes": resolution_notes}},
    )
    if result.modified_count == 1:
        return jsonify({"success": True}), 200
    else:
        return jsonify(
            {"success": False, "error": "Alert not found or not updated."}
        ), 404


@compliance_bp.route("/audit-trail", methods=["GET"])
@jwt_required()
def audit_trail():
    db = get_db()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit
    # Example: fetch audit logs from a collection (implement as needed)
    logs_cursor = db.audit_trail.find().sort("timestamp", -1).skip(skip).limit(limit)
    logs = [
        {
            "timestamp": log.get("timestamp"),
            "user": log.get("user"),
            "action": log.get("action"),
            "details": log.get("details"),
        }
        for log in logs_cursor
    ]
    return jsonify(audit_trail=logs), 200
