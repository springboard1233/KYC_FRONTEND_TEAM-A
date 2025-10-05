#!/usr/bin/env python3
"""
Startup script for Milestone 3: AML/KYC Compliance System
Runs both Flask backend and FastAPI compliance service using environment variables for configuration.
"""

import os
import sys
import subprocess
import time
import multiprocessing
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def run_flask_backend(host: str, port: int):
    """Run the Flask backend service."""
    print(f"🚀 Starting Flask Backend Service on http://{host}:{port}...")
    try:
        # The run.py script will use FLASK_HOST and FLASK_PORT from the environment.
        # We ensure they are set for clarity, though run.py has defaults.
        env = os.environ.copy()
        env["FLASK_HOST"] = host
        env["FLASK_PORT"] = str(port)
        
        # Change to backend directory to ensure relative paths in the app work correctly.
        backend_dir = Path(__file__).parent
        
        subprocess.run([sys.executable, "run.py"], check=True, cwd=backend_dir, env=env)
    except KeyboardInterrupt:
        print("🛑 Flask Backend Service stopped")
    except Exception as e:
        print(f"❌ Flask Backend Service error: {e}")


def run_fastapi_service(host: str, port: int):
    """Run the FastAPI compliance service."""
    print(f"🚀 Starting FastAPI Compliance Service on http://{host}:{port}...")
    try:
        # Change to backend directory to ensure relative paths in the app work correctly.
        backend_dir = Path(__file__).parent
        
        # Run FastAPI app using uvicorn
        subprocess.run(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "aml_compliance_service:app",
                "--host",
                host,
                "--port",
                str(port),
                "--reload",
            ],
            check=True,
            cwd=backend_dir
        )
    except KeyboardInterrupt:
        print("🛑 FastAPI Compliance Service stopped")
    except Exception as e:
        print(f"❌ FastAPI Compliance Service error: {e}")


def main():
    """Main startup function to orchestrate all services."""
    # REFACTOR: Read host and port from environment variables for both services
    flask_host = os.getenv("FLASK_HOST", "127.0.0.1")
    flask_port = int(os.getenv("FLASK_PORT", 5000))
    fastapi_host = os.getenv("FASTAPI_HOST", "127.0.0.1")
    fastapi_port = int(os.getenv("FASTAPI_PORT", 8001))
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    print("=" * 80)
    print("🚀 KYC COMPLIANCE SYSTEM STARTUP SCRIPT")
    print("=" * 80)
    print("🌐 SERVICES & CONFIGURATION:")
    print(f"   - Flask Backend: http://{flask_host}:{flask_port}")
    print(f"   - FastAPI Compliance: http://{fastapi_host}:{fastapi_port}")
    print(f"   - Frontend Expected at: {frontend_url}")
    print("=" * 80)
    print("🗄️  DATABASE:")
    print(f"   - MongoDB URI: {os.getenv('MONGO_URI', 'mongodb://localhost:27017/kyc_database')}")
    print("=" * 80)

    # Start services in separate processes for proper app context isolation
    flask_proc = multiprocessing.Process(target=run_flask_backend, args=(flask_host, flask_port), daemon=True)
    fastapi_proc = multiprocessing.Process(target=run_fastapi_service, args=(fastapi_host, fastapi_port), daemon=True)

    try:
        flask_proc.start()
        # Give the first service a moment to bind to its port before starting the next
        time.sleep(2)
        fastapi_proc.start()

        print("\n✅ Both services have been started successfully!")
        print("📋 Press Ctrl+C to stop all services.")

        # Keep the main process alive to listen for KeyboardInterrupt
        flask_proc.join()
        fastapi_proc.join()

    except KeyboardInterrupt:
        print("\n🛑 Shutting down all services...")
        flask_proc.terminate()
        fastapi_proc.terminate()
        print("✅ Shutdown complete.")


if __name__ == "__main__":
    main()
