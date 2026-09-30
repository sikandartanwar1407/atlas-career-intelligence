"""ATLAS Backend - Assessment API Test Suite.

Tests assessment submission, scoring, diagnostics generation, and authentication protections.
"""

import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id


def run_assessment_unit_tests() -> bool:
    print("=" * 65)
    print("ATLAS Assessment & Scoring API - Local Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # 1. Unauthenticated checks
    print("\n--- 1. Auth Protection Checks ---")
    r = client.post("/api/assessment/submit", json={"role_id": "data-analyst", "answers": []})
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    print("  [OK] POST /api/assessment/submit rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/assessment/latest")
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    print("  [OK] GET /api/assessment/latest rejected unauthenticated request (401 Unauthorized)")

    # 2. Validation error checks (with mock auth)
    print("\n--- 2. Schema Validation Checks ---")
    mock_uid = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: mock_uid

    # Missing answers array
    r = client.post("/api/assessment/submit", json={"role_id": "data-analyst"})
    assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    print("  [OK] POST /api/assessment/submit validated missing answers (422 Unprocessable Entity)")

    # Empty answers list (min_length=1)
    r = client.post("/api/assessment/submit", json={"role_id": "data-analyst", "answers": []})
    assert r.status_code == 422, f"Expected 422 for empty answers, got {r.status_code}"
    print("  [OK] POST /api/assessment/submit validated empty answers array (422 Unprocessable Entity)")

    # Missing question_id or skill_name in answers item
    r = client.post(
        "/api/assessment/submit",
        json={"role_id": "data-analyst", "answers": [{"selected_option": 1}]},
    )
    assert r.status_code == 422, f"Expected 422 for malformed answer item, got {r.status_code}"
    print("  [OK] POST /api/assessment/submit validated malformed answer item (422 Unprocessable Entity)")

    # 3. Successful Submission & Scoring (Mocked Supabase Client)
    print("\n--- 3. End-to-End Submission & Scoring Workflow ---")
    mock_candidate_id = str(uuid.uuid4())
    mock_submission_id = str(uuid.uuid4())

    mock_supabase = MagicMock()
    # Mock candidate profile lookup
    mock_supabase.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": mock_candidate_id, "target_role": "Data Analyst", "availability_hours_per_week": 10}
    )
    # Mock submission insert
    mock_supabase.table().insert().execute.return_value = MagicMock(
        data=[
            {
                "id": mock_submission_id,
                "candidate_id": mock_candidate_id,
                "role_id": "data-analyst",
                "overall_demonstrated": 67,
                "largest_gap_skill": "Power BI",
                "completed_at": "2026-09-30T10:00:00Z",
                "created_at": "2026-09-30T10:00:00Z",
            }
        ]
    )
    # Mock diagnostics upsert
    mock_supabase.table().upsert().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "candidate_id": mock_candidate_id,
                "skill_name": "SQL",
                "display_name": "SQL",
                "baseline_score": 60,
                "demonstrated_score": 100,
                "role_threshold": 80,
                "gap": 0,
                "priority_level": "LOW PRIORITY",
                "evidence_status": "Strong",
                "description": "Demonstrated competency in SQL meets target threshold.",
                "strategic_note": "Focus sprint roadmap and evidence artifacts on SQL capabilities.",
            },
            {
                "id": str(uuid.uuid4()),
                "candidate_id": mock_candidate_id,
                "skill_name": "Power BI",
                "display_name": "Power BI",
                "baseline_score": 50,
                "demonstrated_score": 33,
                "role_threshold": 80,
                "gap": 47,
                "priority_level": "HIGH PRIORITY",
                "evidence_status": "Missing",
                "description": "Critical competency deficit in Power BI. Immediate calibration required.",
                "strategic_note": "Focus sprint roadmap and evidence artifacts on Power BI capabilities.",
            },
        ]
    )

    with patch("app.services.assessment_service.get_supabase_client", return_value=mock_supabase):
        submit_payload = {
            "role_id": "data-analyst",
            "answers": [
                {"question_id": "sql-01", "skill_name": "SQL", "selected_option": 1},
                {"question_id": "sql-02", "skill_name": "SQL", "selected_option": 2},
                {"question_id": "sql-03", "skill_name": "SQL", "selected_option": 1},
                {"question_id": "pbi-01", "skill_name": "Power BI", "selected_option": 1},
                {"question_id": "pbi-02", "skill_name": "Power BI", "selected_option": 0},  # incorrect
                {"question_id": "pbi-03", "skill_name": "Power BI", "selected_option": 0},  # incorrect
            ],
            "self_ratings": {
                "SQL": 60,
                "Power BI": 50,
            },
        }

        r = client.post("/api/assessment/submit", json=submit_payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["id"] == mock_submission_id
        assert data["candidate_id"] == mock_candidate_id
        assert data["role_id"] == "data-analyst"
        assert len(data["skill_diagnostics"]) >= 2
        print(f"  [OK] POST /api/assessment/submit returned valid structured response (ID: {data['id'][:8]}...)")
        print(f"       Overall demonstrated score: {data['overall_demonstrated']}")
        print(f"       Largest gap skill: {data['largest_gap_skill']}")
        print(f"       Skill diagnostics count: {len(data['skill_diagnostics'])}")

    # 4. Latest Assessment Retrieval
    print("\n--- 4. Latest Assessment Retrieval ---")
    mock_supabase_latest = MagicMock()
    mock_supabase_latest.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": mock_candidate_id}
    )
    mock_supabase_latest.table().select().eq().order().limit().execute.return_value = MagicMock(
        data=[
            {
                "id": mock_submission_id,
                "candidate_id": mock_candidate_id,
                "role_id": "data-analyst",
                "overall_demonstrated": 67,
                "largest_gap_skill": "Power BI",
                "completed_at": "2026-09-30T10:00:00Z",
                "created_at": "2026-09-30T10:00:00Z",
            }
        ]
    )
    mock_supabase_latest.table().select().eq().order().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "candidate_id": mock_candidate_id,
                "skill_name": "Power BI",
                "display_name": "Power BI",
                "baseline_score": 50,
                "demonstrated_score": 33,
                "role_threshold": 80,
                "gap": 47,
                "priority_level": "HIGH PRIORITY",
                "evidence_status": "Missing",
                "description": "Critical competency deficit in Power BI.",
                "strategic_note": "Focus sprint roadmap on Power BI.",
            }
        ]
    )
    mock_supabase_latest.table().select().eq().execute.return_value = MagicMock(
        count=6, data=[]
    )

    with patch("app.services.assessment_service.get_supabase_client", return_value=mock_supabase_latest):
        r = client.get("/api/assessment/latest")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["id"] == mock_submission_id
        assert data["overall_demonstrated"] == 67
        print("  [OK] GET /api/assessment/latest returned latest candidate submission successfully.")

    app.dependency_overrides.clear()
    print("\n" + "=" * 65)
    print("ALL ASSESSMENT API UNIT TESTS PASSED (100%)")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_assessment_unit_tests()
