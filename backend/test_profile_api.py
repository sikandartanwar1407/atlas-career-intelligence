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


def run_tests() -> None:
    print("=" * 65)
    print("ATLAS Candidate Profile API - Local Verification Suite")
    print("=" * 65)

    base_url = "http://localhost:8000"
    settings = get_settings()

    # 1. Health Check
    print("\n[1/3] Checking server connectivity...")
    health_resp = make_request(f"{base_url}/api/health")
    if health_resp["status"] == 200:
        print("  -> FastAPI Server: ONLINE (http://localhost:8000)")
    else:
        print("  -> FastAPI Server: OFFLINE or UNREACHABLE")
        print("     Please ensure the server is running with:")
        print("     venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --port 8000")
        sys.exit(1)

    # 2. Unauthenticated 401 Rejection Test
    print("\n[2/3] Testing unauthenticated GET /api/profile...")
    unauth_resp = make_request(f"{base_url}/api/profile")
    print(f"  -> GET /api/profile status: {unauth_resp['status']}")
    print(f"  -> Result category: {categorize_response(unauth_resp['status'])}")
    if unauth_resp["status"] == 401:
        print("  -> Auth Protection: WORKING (Missing token rejected with 401)")
    else:
        print("  -> Auth Protection: WARNING (Expected 401 Unauthorized)")

    # 3. Authenticated Test Mode via TEST_USER_EMAIL & TEST_USER_PASSWORD
    print("\n[3/3] Authenticated Test Mode...")
    test_email = os.environ.get("TEST_USER_EMAIL", "").strip()
    test_password = os.environ.get("TEST_USER_PASSWORD", "").strip()

    if not test_email or not test_password:
        print("  -> TEST_USER_EMAIL or TEST_USER_PASSWORD missing.")
        print("  -> Authenticated test SKIPPED.")
        print("  -> To run the authenticated test, set the environment variables:")
        print('     $env:TEST_USER_EMAIL="your_email@example.com"')
        print('     $env:TEST_USER_PASSWORD="your_password"')
        print("     venv\\Scripts\\python.exe test_profile_api.py")
    else:
        print("  -> Test credentials detected in environment.")
        supabase_key = (
            os.environ.get("SUPABASE_ANON_KEY")
            or getattr(settings, "SUPABASE_ANON_KEY", None)
            or settings.SUPABASE_SERVICE_ROLE_KEY
        )

        access_token: Optional[str] = None
        if not settings.SUPABASE_URL or not supabase_key:
            print("  -> Supabase URL or Key not configured in .env.")
            print("  -> Auth login: FAILED")
            print("  -> Access token obtained: NO")
        else:
            try:
                auth_client: Client = create_client(settings.SUPABASE_URL, supabase_key)
                auth_response = auth_client.auth.sign_in_with_password(
                    {
                        "email": test_email,
                        "password": test_password,
                    }
                )
                if auth_response and auth_response.session and auth_response.session.access_token:
                    access_token = auth_response.session.access_token
                    print("  -> Auth login: SUCCESS")
                    print("  -> Access token obtained: YES")
                else:
                    print("  -> Auth login: FAILED")
                    print("  -> Access token obtained: NO")
            except Exception:
                print("  -> Auth login: FAILED")
                print("  -> Access token obtained: NO")

        if access_token:
            print("\n  Executing GET /api/profile with authenticated session...")
            auth_resp = make_request(f"{base_url}/api/profile", token=access_token)
            print(f"  -> GET /api/profile status: {auth_resp['status']}")
            print(f"  -> Result category: {categorize_response(auth_resp['status'])}")

    print("\n" + "=" * 65)
    print("TEST RUN COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
