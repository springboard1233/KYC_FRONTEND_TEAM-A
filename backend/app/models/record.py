# FILE: backend/app/models/record.py
import logging
from datetime import datetime
from bson.objectid import ObjectId

from ..utils.database import get_db

logger = logging.getLogger(__name__)


class EnhancedRecord:
    """
    Enhanced Record model for managing document records in MongoDB.
    Handles both pending and permanent records.
    """

    def __init__(self, **kwargs):
        self._id = kwargs.get("_id")
        user_id = kwargs.get("user_id")
        if isinstance(user_id, str):
            self.user_id = ObjectId(user_id)
        else:
            self.user_id = user_id

        self.document_type = kwargs.get("document_type")
        self.filename = kwargs.get("filename")
        self.user_entered_name = kwargs.get("user_entered_name")
        self.status = kwargs.get("status", "pending")

        created_at = kwargs.get("created_at", datetime.utcnow())
        self.created_at = (
            datetime.fromisoformat(created_at)
            if isinstance(created_at, str)
            else created_at
        )

        updated_at = kwargs.get("updated_at", datetime.utcnow())
        self.updated_at = (
            datetime.fromisoformat(updated_at)
            if isinstance(updated_at, str)
            else updated_at
        )

        # AI & Processing Results
        self.extracted_fields = kwargs.get("extracted_fields", {})
        self.fraud_analysis = kwargs.get("fraud_analysis", {})
        self.validation = kwargs.get("validation", {})
        self.confidence_score = kwargs.get("confidence_score", 0.0)
        self.fraud_score = kwargs.get("fraud_score", 0.0)
        self.risk_category = kwargs.get("risk_category", "low")
        self.risk_factors = kwargs.get("risk_factors", [])
        self.manipulation_result = kwargs.get("manipulation_result", {})
        self.duplicate_check = kwargs.get("duplicate_check", [])
        self.doc_hash = kwargs.get("doc_hash")
        self.processing_details = kwargs.get("processing_details", {})
        self.verified_name = kwargs.get("verified_name", "")
        self.decision = kwargs.get("decision", "")
        self.admin_comment = kwargs.get("admin_comment", "")

    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "document_type": self.document_type,
            "filename": self.filename,
            "user_entered_name": self.user_entered_name,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "extracted_fields": self.extracted_fields,
            "fraud_analysis": self.fraud_analysis,
            "validation": self.validation,
            "confidence_score": self.confidence_score,
            "fraud_score": self.fraud_score,
            "risk_category": self.risk_category,
            "risk_factors": self.risk_factors,
            "manipulation_result": self.manipulation_result,
            "duplicate_check": self.duplicate_check,
            "doc_hash": self.doc_hash,
            "processing_details": self.processing_details,
            "verified_name": self.verified_name,
            "decision": self.decision,
            "admin_comment": self.admin_comment,
        }

    def save(self):
        db = get_db()
        # Use a dictionary with the correct BSON types for saving to the DB
        record_data = self.__dict__.copy()
        # Remove the stringified '_id' if it's there
        if record_data.get("_id") is None:
            record_data.pop("_id", None)

        if self._id:
            db.records.update_one(
                {"_id": ObjectId(self._id)},
                {"$set": {k: v for k, v in record_data.items() if k != "_id"}},
            )
        else:
            # Ensure user_id is an ObjectId before inserting
            record_data["user_id"] = ObjectId(self.user_id)
            result = db.records.insert_one(record_data)
            self._id = result.inserted_id
        return self._id

    @staticmethod
    def get_by_id(record_id):
        db = get_db()
        doc = db.records.find_one({"_id": ObjectId(record_id)})
        if doc:
            return EnhancedRecord(**doc)
        return None

    @staticmethod
    def get_by_user(user_id):
        db = get_db()
        records = db.records.find({"user_id": ObjectId(user_id)})
        return [EnhancedRecord(**rec) for rec in records]

    @staticmethod
    def get_all():
        db = get_db()
        records = db.records.find()
        return [EnhancedRecord(**rec) for rec in records]
