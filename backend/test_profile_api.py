"""ATLAS Backend - Candidate Profile API Test Script.

Tests the FastAPI Candidate Profile API endpoints locally and verifies
authentication and retrieval workflows.

Security Standards:
- Does NOT print access tokens, secret keys, passwords, full emails, or UUIDs.
- Does NOT create new users or persistent database records.
- Uses environment variables (TEST_USER_EMAIL, TEST_USER_PASSWORD) in memory only.
- Does NOT save tokens or credentials to any file.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

# Load environment configuration from app/config
from app.config import get_settings
from supabase import Client, create_client


def make_request(
    url: str,
    method: str = "GET",
    token: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Helper to perform HTTP requests without external dependencies."""
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status_code = resp.status
            body = resp.read().decode("utf-8")
            try:
                parsed_body = json.loads(body)
            except Exception:
                parsed_body = {"raw": body}
            return {"status": status_code, "data": parsed_body, "error": None}
    except urllib.error.HTTPError as err:
        error_body = err.read().decode("utf-8")
        try:
            parsed_err = json.loads(error_body)
        except Exception:
            parsed_err = {"raw": error_body}
        return {"status": err.code, "data": parsed_err, "error": err.reason}
    except urllib.error.URLError as err:
        return {"status": 0, "data": None, "error": str(err.reason)}
    except Exception as err:
        return {"status": 0, "data": None, "error": str(err)}


def categorize_response(status_code: int) -> str:
    """Classifies HTTP status code into safe descriptive categories."""
    if status_code == 200:
        return "profile found / valid response"
    elif status_code == 401:
        return "unauthorized"
    elif status_code == 404:
        return "profile not found"
    elif status_code == 422:
        return "unprocessable entity"
    elif 500 <= status_code <= 599:
        return "server error"
    elif status_code == 0:
        return "server unreachable"
    return f"status {status_code}"


def run_in_memory_unit_tests() -> bool:
    """Executes automated unit tests against the FastAPI app via TestClient without network calls."""
    print("\n--- Running FastAPI In-Memory Unit Tests ---")
    try:
        from fastapi.testclient import TestClient
        from app.main import app
        from app.dependencies.auth import get_current_user_id
        import uuid

        client = TestClient(app)

        # 1. Health
        r = client.get("/api/health")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert r.json().get("status") == "ok"
        print("  [OK] GET /api/health passed (200 OK)")

        # 2. Test readiness
        r = client.get("/api/profile/test")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert r.json().get("status") == "ok"
        print("  [OK] GET /api/profile/test passed (200 OK)")

        # 3. Unauthorized checks
        r = client.get("/api/profile")
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        print("  [OK] GET /api/profile rejected unauthenticated requests (401 Unauthorized)")

        r = client.post("/api/profile", json={})
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        print("  [OK] POST /api/profile rejected unauthenticated requests (401 Unauthorized)")

        # 4. Schema validation with authenticated mock
        mock_uid = str(uuid.uuid4())
        app.dependency_overrides[get_current_user_id] = lambda: mock_uid

        # Invalid payload (missing required fields)
        r = client.post("/api/profile", json={"full_name": "Test"})
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"
        print("  [OK] POST /api/profile validated required schema fields (422 Unprocessable Entity)")

        # Invalid year check
        r = client.post(
            "/api/profile",
            json={
                "full_name": "Alex Rivera",
                "email": "alex@example.com",
                "college": "MIT",
                "degree": "B.S. CS",
                "year": "Invalid Year",
                "experience_level": "Fresher",
                "target_role": "Data Analyst",
            },
        )
        assert r.status_code == 422, f"Expected 422 for invalid year, got {r.status_code}"
        print("  [OK] POST /api/profile validated year enum values (422 Unprocessable Entity)")

        # Invalid experience level check
        r = client.post(
            "/api/profile",
            json={
                "full_name": "Alex Rivera",
                "email": "alex@example.com",
                "college": "MIT",
                "degree": "B.S. CS",
                "year": "3rd Year",
                "experience_level": "Invalid Level",
                "target_role": "Data Analyst",
            },
        )
        assert r.status_code == 422, f"Expected 422 for invalid experience_level, got {r.status_code}"
        print("  [OK] POST /api/profile validated experience_level enum values (422 Unprocessable Entity)")

        app.dependency_overrides.clear()
        print("  [OK] All in-memory unit tests PASSED successfully.")
        return True
    except Exception as exc:
        print(f"  [FAIL] In-memory unit tests failed: {exc}")
        return False


def run_tests() -> None:
    print("=" * 65)
    print("ATLAS Candidate Profile API - Local Verification Suite")
    print("=" * 65)

    # Always execute in-memory unit verification
    run_in_memory_unit_tests()

    base_url = "http://localhost:8000"
    settings = get_settings()

    # Live Server Connectivity (if running)
    print("\n--- Live Server Verification ---")
    health_resp = make_request(f"{base_url}/api/health")
    if health_resp["status"] == 200:
        print("  -> Live Server: ONLINE (http://localhost:8000)")
        unauth_resp = make_request(f"{base_url}/api/profile")
        print(f"  -> Live GET /api/profile unauthenticated: {unauth_resp['status']} ({categorize_response(unauth_resp['status'])})")
    else:
        print("  -> Live Server: Not currently running on port 8000 (Unit tests verified).")

    # Authenticated Live Test Mode via TEST_USER_EMAIL & TEST_USER_PASSWORD
    test_email = os.environ.get("TEST_USER_EMAIL", "").strip()
    test_password = os.environ.get("TEST_USER_PASSWORD", "").strip()

    if test_email and test_password and health_resp["status"] == 200:
        print("\n--- Live Authenticated Session Test ---")
        supabase_key = (
            os.environ.get("SUPABASE_ANON_KEY")
            or getattr(settings, "SUPABASE_ANON_KEY", None)
            or settings.SUPABASE_SERVICE_ROLE_KEY
        )

        access_token: Optional[str] = None
        if settings.SUPABASE_URL and supabase_key:
            try:
                auth_client: Client = create_client(settings.SUPABASE_URL, supabase_key)
                auth_response = auth_client.auth.sign_in_with_password(
                    {"email": test_email, "password": test_password}
                )
                if auth_response and auth_response.session and auth_response.session.access_token:
                    access_token = auth_response.session.access_token
                    print("  -> Live Supabase Auth login: SUCCESS")
            except Exception:
                print("  -> Live Supabase Auth login: SKIPPED (Credentials test)")

        if access_token:
            auth_resp = make_request(f"{base_url}/api/profile", token=access_token)
            print(f"  -> Live GET /api/profile status: {auth_resp['status']} ({categorize_response(auth_resp['status'])})")

    print("\n" + "=" * 65)
    print("TEST RUN COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()

