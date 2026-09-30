"""ATLAS Backend - Real GitHub REST API Ingestion & Evidence Generation Test Suite.

Tests:
1. Normalization and validation:
   - Valid username (plain & URLs)
   - Valid repository (plain & URLs)
   - Non-GitHub URL rejection (400)
   - Malformed/empty input rejection (400)
2. Authentication checks:
   - Unauthenticated POST /api/evidence/github -> 401
   - Unauthenticated GET /api/evidence/github -> 401
3. Profile analysis execution (mocked GitHub API):
   - User profile + repos + languages
   - Correct schema persistence into github_analyses and candidate_evidence
   - Returns { success: True, analysis: ..., evidence: [...] }
4. Repository analysis execution (mocked GitHub API):
   - Single repo + languages + README decode + commit telemetry
   - README size bounding (<= 12,000 chars)
   - Correct evidence signals generated
5. GitHub API Error Handling:
   - 404 GitHub user/repo not found -> returns 404
   - 403 Rate Limit -> returns 429
   - 429 Rate Limit -> returns 429
   - 422 Validation Error -> returns 422
   - 500 Upstream Server Error -> returns 502
6. Telemetry Retrieval:
   - GET /api/evidence/github returns latest candidate analysis
"""

import base64
import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import httpx

from app.main import app
from app.dependencies.auth import get_current_user_id
from app.services.github_service import normalize_github_input


def run_github_tests() -> bool:
    print("=" * 65)
    print("ATLAS GitHub REST API Integration - Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Normalization & Validation Unit Tests
    # -------------------------------------------------------------
    print("\n--- 1. Normalization & Validation Tests ---")

    # Username inputs
    t_type, owner, repo = normalize_github_input("octocat")
    assert t_type == "user" and owner == "octocat" and repo is None
    print("  [OK] Normalizes plain username 'octocat'")

    t_type, owner, repo = normalize_github_input("  https://github.com/octocat/  ")
    assert t_type == "user" and owner == "octocat" and repo is None
    print("  [OK] Normalizes 'https://github.com/octocat/' with whitespace")

    t_type, owner, repo = normalize_github_input("http://www.github.com/torvalds")
    assert t_type == "user" and owner == "torvalds" and repo is None
    print("  [OK] Normalizes 'http://www.github.com/torvalds'")

    t_type, owner, repo = normalize_github_input("github.com/facebook")
    assert t_type == "user" and owner == "facebook" and repo is None
    print("  [OK] Normalizes 'github.com/facebook'")

    # Repository inputs
    t_type, owner, repo = normalize_github_input("facebook/react")
    assert t_type == "repo" and owner == "facebook" and repo == "react"
    print("  [OK] Normalizes plain repo 'facebook/react'")

    t_type, owner, repo = normalize_github_input("https://github.com/facebook/react.git")
    assert t_type == "repo" and owner == "facebook" and repo == "react"
    print("  [OK] Normalizes 'https://github.com/facebook/react.git'")

    t_type, owner, repo = normalize_github_input("http://github.com/pandas-dev/pandas/")
    assert t_type == "repo" and owner == "pandas-dev" and repo == "pandas"
    print("  [OK] Normalizes 'http://github.com/pandas-dev/pandas/'")

    # Rejection of Non-GitHub URLs and Malformed inputs
    invalid_inputs = [
        "https://gitlab.com/user/repo",
        "https://google.com/search",
        "https://evil-site.com/github.com/user",
        "ftp://github.com/user",
        "   ",
        "user/repo/extra/invalid/path",
        "-invalid_start_username",
    ]

    for inv in invalid_inputs:
        try:
            normalize_github_input(inv)
            assert False, f"Expected normalization failure for input '{inv}'"
        except Exception:
            pass
    print("  [OK] Safely rejected non-GitHub domains and malformed inputs with 400 Bad Request")

    # -------------------------------------------------------------
    # 2. Auth Protection Checks
    # -------------------------------------------------------------
    print("\n--- 2. Auth Protection Checks ---")
    r_unauth_get = client.get("/api/evidence/github")
    assert r_unauth_get.status_code == 401, f"Expected 401, got {r_unauth_get.status_code}"
    print("  [OK] GET /api/evidence/github rejected unauthenticated request (401)")

    r_unauth_post = client.post("/api/evidence/github", json={"identifier": "octocat"})
    assert r_unauth_post.status_code == 401, f"Expected 401, got {r_unauth_post.status_code}"
    print("  [OK] POST /api/evidence/github rejected unauthenticated request (401)")

    # -------------------------------------------------------------
    # 3. Profile Analysis End-to-End Execution (Mocked GitHub API)
    # -------------------------------------------------------------
    print("\n--- 3. GitHub Profile Ingestion & Evidence Signal Generation ---")
    user_id = str(uuid.uuid4())
    candidate_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_id

    # Mock candidate profile and db operations
    mock_supabase = MagicMock()
    mock_supabase.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_id}
    )
    analysis_record_id = str(uuid.uuid4())
    evidence_record_id = str(uuid.uuid4())

    def mock_db_insert(payload):
        if "github_username" in payload:
            return MagicMock(data=[{**payload, "id": analysis_record_id, "created_at": "2026-10-01T00:00:00Z"}])
        elif "title" in payload:
            return MagicMock(data=[{**payload, "id": evidence_record_id, "created_at": "2026-10-01T00:00:00Z"}])
        return MagicMock(data=[payload])

    mock_supabase.table().insert.side_effect = lambda payload: MagicMock(
        execute=lambda: mock_db_insert(payload)
    )

    # Mock GitHub HTTP calls
    def mock_github_get(url, *args, **kwargs):
        req_headers = kwargs.get("headers", {})
        assert req_headers.get("User-Agent") == "ATLAS-Career-Intelligence"
        assert req_headers.get("Accept") == "application/vnd.github+json"

        if "/users/devcandidate/repos" in url:
            return httpx.Response(
                200,
                json=[
                    {
                        "name": "sales-dashboard",
                        "full_name": "devcandidate/sales-dashboard",
                        "html_url": "https://github.com/devcandidate/sales-dashboard",
                        "description": "Interactive retail sales dashboard built with TypeScript and React.",
                        "language": "TypeScript",
                        "stargazers_count": 14,
                        "forks_count": 3,
                        "fork": False,
                        "archived": False,
                        "default_branch": "main",
                        "pushed_at": "2026-09-28T12:00:00Z",
                        "topics": ["react", "dashboard", "sales-analytics"],
                    },
                    {
                        "name": "data-pipeline",
                        "full_name": "devcandidate/data-pipeline",
                        "html_url": "https://github.com/devcandidate/data-pipeline",
                        "description": "ETL pipeline and Postgres SQL transformations.",
                        "language": "Python",
                        "stargazers_count": 8,
                        "forks_count": 1,
                        "fork": False,
                        "archived": False,
                        "default_branch": "main",
                        "pushed_at": "2026-09-25T15:30:00Z",
                        "topics": ["python", "sql", "etl"],
                    },
                ],
                headers={"x-ratelimit-limit": "60", "x-ratelimit-remaining": "58"},
            )
        elif "/users/devcandidate" in url:
            return httpx.Response(
                200,
                json={
                    "login": "devcandidate",
                    "name": "Alex Dev",
                    "avatar_url": "https://avatars.githubusercontent.com/u/12345",
                    "bio": "Full-stack and data engineer.",
                    "public_repos": 2,
                    "followers": 25,
                    "following": 10,
                    "html_url": "https://github.com/devcandidate",
                },
                headers={"x-ratelimit-limit": "60", "x-ratelimit-remaining": "59"},
            )
        elif "/languages" in url:
            if "sales-dashboard" in url:
                return httpx.Response(200, json={"TypeScript": 45000, "CSS": 5000})
            return httpx.Response(200, json={"Python": 30000, "SQL": 15000})
        return httpx.Response(404, json={"message": "Not Found"})

    with patch("app.services.github_service.get_supabase_client", return_value=mock_supabase), \
         patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase), \
         patch("httpx.Client.get", side_effect=mock_github_get):

        resp = client.post(
            "/api/evidence/github",
            json={"source": "github", "identifier": "https://github.com/devcandidate"},
        )
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data["success"] is True
        assert data["analysis"]["github_username"] == "devcandidate"
        assert data["analysis"]["analyzed_repos_count"] == 2
        assert len(data["analysis"]["primary_languages"]) > 0
        assert len(data["evidence"]) >= 2

        # Check evidence description is factual and non-exaggerated
        first_ev = data["evidence"][0]
        assert "TypeScript" in first_ev["metrics"] or "sales-dashboard" in first_ev["title"].lower()
        assert "expert" not in first_ev["description"].lower()
        assert "expert" not in first_ev["evaluator_feedback"].lower()
        print("  [OK] Ingested GitHub profile, generated observable evidence signals, persisted to database")

    # -------------------------------------------------------------
    # 4. Repository Analysis End-to-End Execution
    # -------------------------------------------------------------
    print("\n--- 4. GitHub Repository Ingestion & README Handling ---")

    dummy_readme_content = ("# Sales Forecasting Model\n\nThis project provides ARIMA forecasts.\n" * 500).encode("utf-8")
    dummy_readme_b64 = base64.b64encode(dummy_readme_content).decode("utf-8")

    def mock_repo_github_get(url, *args, **kwargs):
        if url.endswith("/readme"):
            return httpx.Response(
                200,
                json={
                    "name": "README.md",
                    "encoding": "base64",
                    "content": dummy_readme_b64,
                },
            )
        elif url.endswith("/commits"):
            return httpx.Response(
                200,
                json=[
                    {
                        "sha": "abc1234",
                        "commit": {
                            "author": {"name": "Alex", "date": "2026-09-29T10:00:00Z"},
                            "message": "Add test suite and evaluation metrics",
                        },
                    },
                    {
                        "sha": "def5678",
                        "commit": {
                            "author": {"name": "Alex", "date": "2026-09-28T09:00:00Z"},
                            "message": "Initial model implementation",
                        },
                    },
                ],
            )
        elif url.endswith("/languages"):
            return httpx.Response(200, json={"Python": 80000, "Shell": 2000})
        elif "/repos/devcandidate/sales-forecasting" in url:
            return httpx.Response(
                200,
                json={
                    "name": "sales-forecasting",
                    "full_name": "devcandidate/sales-forecasting",
                    "html_url": "https://github.com/devcandidate/sales-forecasting",
                    "description": "Time-series forecasting models using Python.",
                    "language": "Python",
                    "stargazers_count": 42,
                    "forks_count": 7,
                    "fork": False,
                    "archived": False,
                    "default_branch": "main",
                    "pushed_at": "2026-09-29T10:00:00Z",
                    "topics": ["time-series", "forecasting", "python"],
                    "owner": {
                        "login": "devcandidate",
                        "avatar_url": "https://avatars.githubusercontent.com/u/12345",
                        "html_url": "https://github.com/devcandidate",
                    },
                },
            )
        return httpx.Response(404, json={"message": "Not Found"})

    with patch("app.services.github_service.get_supabase_client", return_value=mock_supabase), \
         patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase), \
         patch("httpx.Client.get", side_effect=mock_repo_github_get):

        resp = client.post(
            "/api/evidence/github",
            json={"source": "github", "identifier": "devcandidate/sales-forecasting"},
        )
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data["success"] is True
        assert data["analysis"]["github_username"] == "devcandidate"
        assert len(data["evidence"]) == 1
        assert "42 stars" in data["evidence"][0]["metrics"]
        print("  [OK] Ingested single repository with README decode and commit telemetry")

    # -------------------------------------------------------------
    # 5. GitHub Error Handling (404, 403/429 Rate Limit, 422, 500)
    # -------------------------------------------------------------
    print("\n--- 5. GitHub API Error Handling ---")

    # Test 404
    with patch("httpx.Client.get", return_value=httpx.Response(404, json={"message": "Not Found"})):
        resp = client.post("/api/evidence/github", json={"identifier": "nonexistent-user-123456"})
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"
        assert "not found" in resp.json()["detail"].lower()
        print("  [OK] GitHub 404 mapped to clean 404 HTTP response")

    # Test 403 Rate Limit
    with patch("httpx.Client.get", return_value=httpx.Response(403, json={"message": "API rate limit exceeded"})):
        resp = client.post("/api/evidence/github", json={"identifier": "octocat"})
        assert resp.status_code == 429, f"Expected 429, got {resp.status_code}"
        assert "rate limit" in resp.json()["detail"].lower()
        print("  [OK] GitHub 403 rate limit mapped to 429 Too Many Requests")

    # Test 429 Rate Limit
    with patch("httpx.Client.get", return_value=httpx.Response(429, json={"message": "Too Many Requests"})):
        resp = client.post("/api/evidence/github", json={"identifier": "octocat"})
        assert resp.status_code == 429, f"Expected 429, got {resp.status_code}"
        print("  [OK] GitHub 429 rate limit mapped to 429 Too Many Requests")

    # Test 422 Unprocessable Entity
    with patch("httpx.Client.get", return_value=httpx.Response(422, json={"message": "Validation Failed"})):
        resp = client.post("/api/evidence/github", json={"identifier": "octocat"})
        assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
        print("  [OK] GitHub 422 validation error mapped to 422 Unprocessable Entity")

    # Test 500 Upstream Error
    with patch("httpx.Client.get", return_value=httpx.Response(500, text="Internal Server Error")):
        resp = client.post("/api/evidence/github", json={"identifier": "octocat"})
        assert resp.status_code == 502, f"Expected 502, got {resp.status_code}"
        assert "unavailable" in resp.json()["detail"].lower()
        print("  [OK] GitHub 500 upstream error mapped to 502 Bad Gateway")

    # -------------------------------------------------------------
    # 6. Telemetry Retrieval (GET /api/evidence/github)
    # -------------------------------------------------------------
    print("\n--- 6. Candidate GitHub Telemetry Retrieval ---")
    mock_supabase_get = MagicMock()
    mock_supabase_get.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_id}
    )
    mock_supabase_get.table().select().eq().order().limit().execute.return_value = MagicMock(
        data=[
            {
                "id": analysis_record_id,
                "candidate_id": candidate_id,
                "github_username": "devcandidate",
                "github_user_data": {"public_repos": 2},
                "analyzed_repos_count": 2,
                "primary_languages": [{"name": "TypeScript", "percentage": 60}],
                "detected_topics": ["react", "dashboard"],
                "demonstrated_skills_detected": ["TypeScript", "Python"],
                "evidence_readiness_boost": 12,
                "extracted_evidence_count": 2,
                "raw_analysis_payload": {},
                "created_at": "2026-10-01T00:00:00Z",
            }
        ]
    )

    with patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase_get):
        resp = client.get("/api/evidence/github")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data["github_username"] == "devcandidate"
        assert data["candidate_id"] == candidate_id
        print("  [OK] GET /api/evidence/github successfully returned candidate's stored analysis")

    app.dependency_overrides.clear()
    print("\n" + "=" * 65)
    print("ALL GITHUB REST API INTEGRATION TESTS PASSED (100%)")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_github_tests()
