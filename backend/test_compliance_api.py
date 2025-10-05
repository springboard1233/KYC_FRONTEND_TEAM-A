# test_compliance_api.py
"""
Automated tests for FastAPI AML/KYC Compliance endpoints.
Run with: pytest test_compliance_api.py
"""
import pytest
from httpx import AsyncClient
from aml_compliance_service import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_compliance_stats():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/compliance-stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_records" in data
        assert "active_alerts" in data
        assert "compliance_score" in data

@pytest.mark.asyncio
async def test_alerts_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/alerts")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

@pytest.mark.asyncio
async def test_verify_identity_missing_fields():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/verify_identity", json={})
        assert resp.status_code == 422  # Unprocessable Entity for missing fields

# Add more tests as needed for /check_fraud, /alerts/{alert_id}/resolve, etc.
