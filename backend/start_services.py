#!/usr/bin/env python3
"""
Startup script for Milestone 3: AML/KYC Compliance System
Runs both Flask backend and FastAPI compliance service
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path


def run_flask_backend():
    """Run the Flask backend service"""
    print("🚀 Starting Flask Backend Service...")
    try:
        # Change to backend directory
        backend_dir = Path(__file__).parent
        os.chdir(backend_dir)

        # Run Flask app
        subprocess.run([sys.executable, "run.py"], check=True)
    except KeyboardInterrupt:
        print("🛑 Flask Backend Service stopped")
    except Exception as e:
        print(f"❌ Flask Backend Service error: {e}")


def run_fastapi_service():
    """Run the FastAPI compliance service"""
    print("🚀 Starting FastAPI Compliance Service...")
    try:
        # Change to backend directory
        backend_dir = Path(__file__).parent
        os.chdir(backend_dir)

        # Run FastAPI app
        subprocess.run(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "aml_compliance_service:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8001",
                "--reload",
            ],
            check=True,
        )
    except KeyboardInterrupt:
        print("🛑 FastAPI Compliance Service stopped")
    except Exception as e:
        print(f"❌ FastAPI Compliance Service error: {e}")


def main():
    """Main startup function"""
    print("=" * 80)
    print("🚀 MILESTONE 3: AML/KYC COMPLIANCE SYSTEM STARTUP")
    print("=" * 80)
    print("🤖 AI FEATURES ENABLED:")
    print("   ✅ AI-Powered Name Matching with Fuzzy Logic")
    print("   ✅ Advanced Document Manipulation Detection")
    print("   ✅ Complete Admin Approval Workflow")
    print("   ✅ Fraud Pattern Analysis & Recognition")
    print("   ✅ Duplicate Document Detection (MongoDB)")
    print("   ✅ Enhanced Analytics & Reporting")
    print("   ✅ MongoDB Database Integration")
    print("   ✅ Real-time Fraud Detection Pipeline")
    print("   ✅ AML/KYC Compliance Rules Engine")
    print("   ✅ Compliance Alerts & Monitoring")
    print("=" * 80)
    print("🌐 SERVICES STARTING:")
    print("   📍 Flask Backend: http://127.0.0.1:5000")
    print("   📍 FastAPI Compliance: http://127.0.0.1:8001")
    print("   📍 Frontend: http://localhost:3000")
    print("=" * 80)
    print("🗄️ MONGODB CONFIGURATION:")
    print("   Database: kyc_database")
    print(
        "   Collections: users, records, permanent_records, admin_decisions, fraud_alerts, audit_logs"
    )
    print("   Connection: mongodb://localhost:27017/")
    print("=" * 80)

    # Start services in separate threads
    flask_thread = threading.Thread(target=run_flask_backend, daemon=True)
    fastapi_thread = threading.Thread(target=run_fastapi_service, daemon=True)

    try:
        # Start both services
        flask_thread.start()
        time.sleep(2)  # Give Flask a moment to start
        fastapi_thread.start()

        print("✅ Both services started successfully!")
        print("📋 Press Ctrl+C to stop all services")

        # Wait for threads to complete
        flask_thread.join()
        fastapi_thread.join()

    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        print("✅ All services stopped successfully!")


if __name__ == "__main__":
    main()

