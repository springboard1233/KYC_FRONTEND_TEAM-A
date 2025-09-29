# FILE: backend/aml_compliance_service.py
# aml_compliance_service.py - AML/KYC Compliance Microservice
"""
Milestone 3: AML & KYC Compliance System Integration
Real-time fraud detection pipeline with compliance rules
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Configure logging
def configure_logging():
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)


configure_logging()
logger = logging.getLogger(__name__)


# --- Project Imports ---
# Use the new, reliable database connector
from db_connector import init_db_connection, close_db_connection, get_collection

# --- DECOUPLING CHANGE: Remove the Flask-dependent model import ---
from app.utils.ocr import OCRProcessor
from app.utils.advanced_fraud_detection import AdvancedFraudDetector


# ================================
# 🏗️ AML COMPLIANCE MODELS
# ================================


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, Enum):
    DUPLICATE_DOCUMENT = "duplicate_document"
    MANIPULATION_DETECTED = "manipulation_detected"
    BLACKLISTED_AADHAAR = "blacklisted_aadhaar"
    MULTIPLE_ACCOUNTS = "multiple_accounts"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    HIGH_RISK_USER = "high_risk_user"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FLAGGED = "flagged"
    REJECTED = "rejected"


@dataclass
class FraudAlert:
    alert_id: str
    record_id: str
    user_id: str
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    confidence_score: float
    metadata: Dict[str, Any]
    created_at: datetime
    status: str = "active"


@dataclass
class ComplianceRule:
    rule_id: str
    rule_name: str
    description: str
    severity: AlertSeverity
    enabled: bool = True


# --- DECOUPLING CHANGE: Create a self-contained dataclass for this service ---
@dataclass
class ComplianceRecord:
    """A simple data structure for holding record info within this service."""

    _id: str
    user_id: str
    document_type: str
    extracted_fields: dict
    fraud_score: float = 0.0
    risk_category: str = "low"


# ================================
# 📊 PYDANTIC MODELS
# ================================


class VerificationRequest(BaseModel):
    document_type: str = Field(..., description="Type of document (aadhaar, pan)")
    user_entered_name: str = Field(..., description="Name entered by user")
    user_id: str = Field(..., description="User ID")
    file_path: str = Field(..., description="Path to uploaded file")


class VerificationResponse(BaseModel):
    verification_id: str
    status: VerificationStatus
    confidence_score: float
    fraud_risk: str
    extracted_fields: Dict[str, Any]
    fraud_analysis: Dict[str, Any]
    alerts: List[Dict[str, Any]]
    processing_time: float
    timestamp: datetime


class FraudCheckRequest(BaseModel):
    record_id: str
    document_type: str
    extracted_fields: Dict[str, Any]
    user_id: str


class FraudCheckResponse(BaseModel):
    fraud_detected: bool
    fraud_score: float
    risk_category: str
    alerts: List[Dict[str, Any]]
    recommendations: List[str]
    confidence: float


class AlertResponse(BaseModel):
    alert_id: str
    record_id: str
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    confidence_score: float
    created_at: datetime
    status: str

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


# ================================
# 🚀 FASTAPI APPLICATION
# ================================

app = FastAPI(
    title="AML/KYC Compliance Service",
    description="Real-time fraud detection and compliance monitoring",
    version="3.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# 🔧 COMPLIANCE RULES ENGINE
# ================================


class ComplianceRulesEngine:
    def __init__(self):
        self.blacklisted_aadhaars = self._load_blacklist()
        self.rules = self._initialize_rules()
        self.suspicious_addresses = {}
        logger.info(f"✅ ComplianceRulesEngine initialized with {len(self.blacklisted_aadhaars)} blacklisted numbers.")

    def _load_blacklist(self) -> set:
        """Loads blacklisted Aadhaar numbers from the database."""
        try:
            blacklist_cursor = get_collection("blacklisted_aadhaars").find({}, {"aadhaar_number": 1})
            return {item["aadhaar_number"] for item in blacklist_cursor}
        except Exception as e:
            logger.error(f"Failed to load Aadhaar blacklist: {e}")
            return set()

    def _initialize_rules(self) -> List[ComplianceRule]:
        """Initialize AML/KYC compliance rules"""
        return [
            ComplianceRule(
                rule_id="rule_001",
                rule_name="Duplicate Aadhaar Detection",
                description="Flag if same Aadhaar number used by multiple users",
                severity=AlertSeverity.HIGH,
            ),
            ComplianceRule(
                rule_id="rule_002",
                rule_name="Document Manipulation",
                description="Detect digitally manipulated documents",
                severity=AlertSeverity.CRITICAL,
            ),
            ComplianceRule(
                rule_id="rule_003",
                rule_name="Multiple Accounts Same Address",
                description="Flag multiple accounts using same address",
                severity=AlertSeverity.MEDIUM,
            ),
            ComplianceRule(
                rule_id="rule_004",
                rule_name="High Risk User Pattern",
                description="Detect users with multiple flagged documents",
                severity=AlertSeverity.HIGH,
            ),
            ComplianceRule(
                rule_id="rule_005",
                rule_name="Blacklisted Aadhaar",
                description="Check against blacklisted Aadhaar numbers",
                severity=AlertSeverity.CRITICAL,
            ),
        ]

    async def apply_rules(
        self, record: ComplianceRecord, fraud_analysis: Dict
    ) -> List[FraudAlert]:
        """Apply all compliance rules to a record"""
        alerts = []

        # Rule 1: Duplicate Aadhaar Detection
        if record.document_type == "aadhaar" and record.extracted_fields.get(
            "aadhaar_number"
        ):
            duplicate_alerts = await self._check_duplicate_aadhaar(record)
            alerts.extend(duplicate_alerts)

        # Rule 2: Document Manipulation
        if fraud_analysis.get("manipulation_result", {}).get("manipulation_detected"):
            alerts.append(
                self._create_alert(
                    record,
                    AlertType.MANIPULATION_DETECTED,
                    AlertSeverity.CRITICAL,
                    "Document manipulation detected",
                    fraud_analysis["manipulation_result"]["manipulation_score"],
                )
            )

        # Rule 3: Multiple Accounts Same Address
        if record.extracted_fields.get("address"):
            address_alerts = await self._check_multiple_accounts_address(record)
            alerts.extend(address_alerts)

        # Rule 4: High Risk User Pattern
        user_risk_alerts = await self._check_high_risk_user(record)
        alerts.extend(user_risk_alerts)

        # Rule 5: Blacklisted Aadhaar
        if record.document_type == "aadhaar" and record.extracted_fields.get(
            "aadhaar_number"
        ):
            blacklist_alerts = await self._check_blacklisted_aadhaar(record)
            alerts.extend(blacklist_alerts)

        return alerts

    async def _check_duplicate_aadhaar(
        self, record: ComplianceRecord
    ) -> List[FraudAlert]:
        """Check for duplicate Aadhaar numbers"""
        alerts = []
        aadhaar_number = record.extracted_fields.get("aadhaar_number")

        if aadhaar_number:
            # Check in permanent records
            existing_records = get_collection("permanent_records").find(
                {
                    "extracted_fields.aadhaar_number": aadhaar_number,
                    "user_id": {"$ne": record.user_id},
                }
            )

            duplicate_count = len(list(existing_records))
            if duplicate_count > 0:
                alerts.append(
                    self._create_alert(
                        record,
                        AlertType.DUPLICATE_DOCUMENT,
                        AlertSeverity.HIGH,
                        f"Duplicate Aadhaar detected: {duplicate_count} other users have this Aadhaar",
                        95.0,
                    )
                )

        return alerts

    async def _check_multiple_accounts_address(
        self, record: ComplianceRecord
    ) -> List[FraudAlert]:
        """Check for multiple accounts using same address"""
        alerts = []
        address = record.extracted_fields.get("address")

        if address:
            # Simple address matching (in production, use more sophisticated matching)
            address_key = address.lower().strip()

            existing_records = get_collection("permanent_records").find(
                {
                    "extracted_fields.address": {
                        "$regex": address_key,
                        "$options": "i",
                    },
                    "user_id": {"$ne": record.user_id},
                }
            )

            address_count = len(list(existing_records))
            if address_count >= 3:  # Threshold for multiple accounts
                alerts.append(
                    self._create_alert(
                        record,
                        AlertType.MULTIPLE_ACCOUNTS,
                        AlertSeverity.MEDIUM,
                        f"Multiple accounts using same address: {address_count} other users",
                        80.0,
                    )
                )

        return alerts

    async def _check_high_risk_user(self, record: ComplianceRecord) -> List[FraudAlert]:
        """Check if user has multiple flagged documents"""
        alerts = []

        # Count user's flagged records
        flagged_count = get_collection("records").count_documents(
            {"user_id": record.user_id, "fraud_score": {"$gte": 70}}
        )

        if flagged_count >= 2:
            alerts.append(
                self._create_alert(
                    record,
                    AlertType.HIGH_RISK_USER,
                    AlertSeverity.HIGH,
                    f"High risk user: {flagged_count} flagged documents",
                    85.0,
                )
            )

        return alerts

    async def _check_blacklisted_aadhaar(
        self, record: ComplianceRecord
    ) -> List[FraudAlert]:
        """Check against blacklisted Aadhaar numbers"""
        alerts = []
        aadhaar_number = record.extracted_fields.get("aadhaar_number")

        if aadhaar_number and aadhaar_number in self.blacklisted_aadhaars:
            alerts.append(
                self._create_alert(
                    record,
                    AlertType.BLACKLISTED_AADHAAR,
                    AlertSeverity.CRITICAL,
                    "Aadhaar number is blacklisted",
                    100.0,
                )
            )

        return alerts

    def _create_alert(
        self,
        record: ComplianceRecord,
        alert_type: AlertType,
        severity: AlertSeverity,
        message: str,
        confidence: float,
    ) -> FraudAlert:
        """Create a fraud alert"""
        return FraudAlert(
            alert_id=f"alert_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{record._id}",
            record_id=str(record._id),
            user_id=record.user_id,
            alert_type=alert_type,
            severity=severity,
            message=message,
            confidence_score=confidence,
            metadata={
                "document_type": record.document_type,
                "fraud_score": record.fraud_score,
                "risk_category": record.risk_category,
            },
            created_at=datetime.utcnow(),
        )


# ================================
# 🔄 FRAUD DETECTION PIPELINE
# ================================


class FraudDetectionPipeline:
    def __init__(self):
        self.ocr_processor = OCRProcessor()
        self.fraud_detector = AdvancedFraudDetector()
        self.compliance_engine = ComplianceRulesEngine()

    async def process_document(
        self, request: VerificationRequest
    ) -> VerificationResponse:
        """End-to-end document verification pipeline"""
        start_time = datetime.utcnow()

        try:
            # Step 1: OCR Processing
            ocr_result = self.ocr_processor.process_document(
                request.file_path, request.document_type
            )

            if not ocr_result.get("success"):
                raise HTTPException(
                    status_code=422,
                    detail=f"OCR processing failed: {ocr_result.get('error')}",
                )
            extracted_fields = ocr_result.get("extracted_fields", {})

            # Step 2: Fraud Analysis
            fraud_analysis = self.fraud_detector.analyze_document(
                request.file_path,
                extracted_fields,
                request.user_entered_name,
                request.document_type,
                request.user_id,
            )

            # --- DECOUPLING CHANGE: Use the new self-contained dataclass ---
            record = ComplianceRecord(
                _id=f"temp_{datetime.utcnow().timestamp()}",  # Temporary ID for this check
                user_id=request.user_id,
                document_type=request.document_type,
                extracted_fields=extracted_fields,
                fraud_score=fraud_analysis.get("fraud_score", 0.0),
                risk_category=fraud_analysis.get("risk_category", "low"),
            )

            # Step 4: Apply Compliance Rules
            compliance_alerts = await self.compliance_engine.apply_rules(
                record, fraud_analysis
            )

            # Step 5: Determine final status
            status = self._determine_verification_status(
                fraud_analysis, compliance_alerts
            )

            # Step 6: Save alerts to database
            await self._save_alerts(compliance_alerts)

            processing_time = (datetime.utcnow() - start_time).total_seconds()

            return VerificationResponse(
                verification_id=f"verify_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                status=status,
                confidence_score=fraud_analysis.get("ai_confidence", 0.0),
                fraud_risk=fraud_analysis.get("risk_category", "low"),
                extracted_fields=extracted_fields,
                fraud_analysis=fraud_analysis,
                alerts=[self._alert_to_dict(alert) for alert in compliance_alerts],
                processing_time=processing_time,
                timestamp=datetime.utcnow(),
            )

        except HTTPException:
            raise # Re-raise HTTPException directly to preserve status code and detail
        except Exception as e:
            logging.error(f"Pipeline processing error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    def _determine_verification_status(
        self, fraud_analysis: Dict, alerts: List[FraudAlert]
    ) -> VerificationStatus:
        """Determine verification status based on fraud analysis and alerts"""
        fraud_score = fraud_analysis.get("fraud_score", 0.0)
        critical_alerts = [a for a in alerts if a.severity == AlertSeverity.CRITICAL]
        high_alerts = [a for a in alerts if a.severity == AlertSeverity.HIGH]

        if critical_alerts or fraud_score >= 85:
            return VerificationStatus.REJECTED
        elif high_alerts or fraud_score >= 70:
            return VerificationStatus.FLAGGED
        elif fraud_score >= 40:
            return VerificationStatus.PENDING
        else:
            return VerificationStatus.VERIFIED

    async def _save_alerts(self, alerts: List[FraudAlert]):
        """Save fraud alerts to database"""
        if alerts:
            alert_docs = []
            for alert in alerts:
                alert_doc = {
                    "alert_id": alert.alert_id,
                    "record_id": alert.record_id,
                    "user_id": alert.user_id,
                    "alert_type": alert.alert_type.value,
                    "severity": alert.severity.value,
                    "message": alert.message,
                    "confidence_score": alert.confidence_score,
                    "metadata": alert.metadata,
                    "created_at": alert.created_at,
                    "status": alert.status,
                }
                alert_docs.append(alert_doc)

            get_collection("fraud_alerts").insert_many(alert_docs)

    def _alert_to_dict(self, alert: FraudAlert) -> Dict:
        """Convert FraudAlert to dictionary"""
        return {
            "alert_id": alert.alert_id,
            "alert_type": alert.alert_type.value,
            "severity": alert.severity.value,
            "message": alert.message,
            "confidence_score": alert.confidence_score,
            "created_at": alert.created_at.isoformat(),
        }


# ================================
# 🚀 API ENDPOINTS
# ================================

# Initialize pipeline
pipeline = FraudDetectionPipeline()


@app.post("/verify_identity", response_model=VerificationResponse)
async def verify_identity(
    request: VerificationRequest, background_tasks: BackgroundTasks
):
    """
    Main identity verification endpoint
    Runs OCR → NLP → CNN → GNN → Compliance Rules pipeline
    """
    try:
        result = await pipeline.process_document(request)

        # Background task: Send alerts if critical issues found
        critical_alerts = [a for a in result.alerts if a.get("severity") == "critical"]
        if critical_alerts:
            background_tasks.add_task(send_critical_alert, result)

        return result

    except HTTPException:
        raise # Re-raise HTTPException directly to preserve status code and detail
    except Exception as e:
        logger.error(f"Verification error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during verification: {str(e)}")


@app.post("/check_fraud", response_model=FraudCheckResponse)
async def check_fraud(request: FraudCheckRequest):
    try:
        # Create temporary record for fraud checking
        record = ComplianceRecord(
            _id=request.record_id,
            user_id=request.user_id,
            document_type=request.document_type,
            extracted_fields=request.extracted_fields,
        )

        # Run fraud analysis
        fraud_analysis = pipeline.fraud_detector.analyze_document(
            "", request.extracted_fields, "", request.document_type, request.user_id
        )

        # Apply compliance rules
        compliance_alerts = await pipeline.compliance_engine.apply_rules(
            record, fraud_analysis
        )

        return FraudCheckResponse(
            fraud_detected=len(compliance_alerts) > 0
            or fraud_analysis.get("fraud_score", 0) >= 70,
            fraud_score=fraud_analysis.get("fraud_score", 0.0),
            risk_category=fraud_analysis.get("risk_category", "low"),
            alerts=[pipeline._alert_to_dict(alert) for alert in compliance_alerts],
            recommendations=fraud_analysis.get("analysis_details", {}).get(
                "recommendations", []
            ),
            confidence=fraud_analysis.get("ai_confidence", 0.0),
        )

    except Exception as e:
        logger.error(f"Fraud check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/alerts", response_model=List[AlertResponse])
async def get_fraud_alerts(
    severity: Optional[AlertSeverity] = None, status: str = "active", limit: int = 50
):
    """
    Get fraud alerts for compliance dashboard
    """
    try:
        query = {"status": status}
        if severity:
            query["severity"] = severity.value

        alerts_cursor = (
            get_collection("fraud_alerts")
            .find(query)
            .sort("created_at", -1)
            .limit(limit)
        )
        
        alerts = [AlertResponse.model_validate(alert, from_attributes=True) for alert in alerts_cursor]
        return alerts

    except Exception as e:
        logger.error(f"Error fetching fraud alerts: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch fraud alerts.")


@app.get("/compliance-stats")
async def get_compliance_stats():
    """
    Get compliance statistics for dashboard
    """
    try:
        db_records = get_collection("records")
        db_alerts = get_collection("fraud_alerts")

        total_records = db_records.count_documents({})
        total_alerts = db_alerts.count_documents({})
        active_alerts = db_alerts.count_documents({"status": "active"})

        severity_stats = {}
        for severity in AlertSeverity:
            count = db_alerts.count_documents({"severity": severity.value})
            severity_stats[severity.value] = count

        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_alerts = db_alerts.count_documents({"created_at": {"$gte": yesterday}})

        return {
            "total_records": total_records,
            "total_alerts": total_alerts,
            "active_alerts": active_alerts,
            "severity_breakdown": severity_stats,
            "recent_alerts_24h": recent_alerts,
            "compliance_score": max(
                0, 100 - (active_alerts / max(total_records, 1)) * 100
            ),
        }
    except Exception as e:
        logger.error(f"Error fetching compliance stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch compliance statistics.")


@app.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, resolution_notes: str = ""):
    """
    Resolve a fraud alert
    """
    try:
        result = get_collection("fraud_alerts").update_one(
            {"alert_id": alert_id},
            {
                "$set": {
                    "status": "resolved",
                    "resolved_at": datetime.utcnow(),
                    "resolution_notes": resolution_notes,
                }
            },
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"success": True, "message": "Alert resolved successfully"}

    except Exception as e:
        logger.error(f"Resolve alert error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ================================
# 🔔 BACKGROUND TASKS
# ================================


async def send_critical_alert(verification_result: VerificationResponse):
    """
    Send notifications for critical alerts to administrators
    This is a background task that runs after verification
    """
    try:
        critical_alerts = [
            a for a in verification_result.alerts if a.get("severity") == "critical"
        ]
        if not critical_alerts:
            return

        logger.info(f"Sending {len(critical_alerts)} critical alerts to administrators")

        # In a production system, this would:
        # 1. Send emails to compliance officers
        # 2. Send push notifications to admin dashboard
        # 3. Log to audit trail

        # For now, we'll just log and save to a notifications collection
        notifications = []
        for alert in critical_alerts:
            notification = {
                "notification_id": f"notif_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "alert_id": alert.get("alert_id"),
                "severity": "critical",
                "message": f"CRITICAL ALERT: {alert.get('message')}",
                "verification_id": verification_result.verification_id,
                "created_at": datetime.utcnow(),
                "status": "unread",
            }
            notifications.append(notification)

        if notifications:
            get_collection("admin_notifications").insert_many(notifications)
            logger.info(f"✅ {len(notifications)} critical alert notifications saved")

    except Exception as e:
        logger.error(f"Failed to send critical alerts: {str(e)}")


# ================================
# 🔄 LIFECYCLE EVENTS
# ================================


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    init_db_connection()
    # Seed the database with sample blacklisted numbers if the collection is empty
    try:
        blacklist_collection = get_collection("blacklisted_aadhaars")
        if blacklist_collection.count_documents({}) == 0:
            logger.info("Seeding database with sample blacklisted Aadhaar numbers...")
            sample_blacklist = [
                {"aadhaar_number": "999988887777", "reason": "Known fraud case"},
                {"aadhaar_number": "111122223333", "reason": "Associated with synthetic identity"},
                {"aadhaar_number": "123412341234", "reason": "Test fraud number"},
            ]
            blacklist_collection.insert_many(sample_blacklist)
            logger.info("✅ Sample blacklist seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding blacklist: {e}")

    logger.info("✅ AML/KYC Compliance Service started")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    close_db_connection()
    logger.info("✅ AML/KYC Compliance Service shutdown complete")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AML/KYC Compliance", "version": "3.0.0"}


# For local development
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001)