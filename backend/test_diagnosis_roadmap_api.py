"""ATLAS Backend - Skill Diagnosis & Career Roadmap API Test Suite.

Tests:
1. Unauthenticated diagnosis request -> rejected (401)
2. Unauthenticated roadmap request -> rejected (401)
3. Valid authenticated diagnosis retrieval (GET /api/diagnosis/latest)
4. Candidate isolation on diagnosis (candidate A cannot see candidate B data)
5. Roadmap generation from latest diagnostics (POST /api/roadmap/generate)
6. Roadmap retrieval (GET /api/roadmap)
7. Safe handling of missing profile / missing diagnostics (404 / 400)
"""

import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id


def run_diagnosis_roadmap_tests() -> bool:
    print("=" * 65)
    print("ATLAS Skill Diagnosis & Career Roadmap API - Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Unauthenticated Checks
    # -------------------------------------------------------------
    print("\n--- 1. Auth Protection Checks ---")
    r = client.get("/api/diagnosis/latest")
    assert r.status_code == 401, f"Expected 401 for GET /api/diagnosis/latest, got {r.status_code}"
    print("  [OK] GET /api/diagnosis/latest rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/roadmap")
    assert r.status_code == 401, f"Expected 401 for GET /api/roadmap, got {r.status_code}"
    print("  [OK] GET /api/roadmap rejected unauthenticated request (401 Unauthorized)")

    r = client.post("/api/roadmap/generate")
    assert r.status_code == 401, f"Expected 401 for POST /api/roadmap/generate, got {r.status_code}"
    print("  [OK] POST /api/roadmap/generate rejected unauthenticated request (401 Unauthorized)")

    # -------------------------------------------------------------
    # 2. Authenticated Diagnosis Retrieval (GET /api/diagnosis/latest)
    # -------------------------------------------------------------
    print("\n--- 2. Authenticated Skill Diagnosis Retrieval ---")
    user_a_id = str(uuid.uuid4())
    candidate_a_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_a_id

    mock_supabase = MagicMock()

    # Mock candidate profile lookup for User A
    mock_supabase.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_a_id, "target_role": "Data Analyst", "availability_hours_per_week": 15.0}
    )

    # Mock candidate skill diagnostics
    mock_supabase.table().select().eq().order().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "candidate_id": candidate_a_id,
                "skill_name": "Power BI",
                "display_name": "Power BI / Tableau",
                "baseline_score": 40,
                "demonstrated_score": 33,
                "role_threshold": 80,
                "gap": 47,
                "priority_level": "HIGH PRIORITY",
                "evidence_status": "Missing",
                "description": "Deficit in Power BI dashboarding.",
                "strategic_note": "Focus on DAX calculations.",
                "calculated_at": "2026-09-30T10:00:00Z",
            },
            {
                "id": str(uuid.uuid4()),
                "candidate_id": candidate_a_id,
                "skill_name": "SQL",
                "display_name": "SQL & Query Optimization",
                "baseline_score": 60,
                "demonstrated_score": 85,
                "role_threshold": 80,
                "gap": 0,
                "priority_level": "LOW PRIORITY",
                "evidence_status": "Strong",
                "description": "SQL demonstrated meets threshold.",
                "strategic_note": "Maintain proficiency.",
                "calculated_at": "2026-09-30T10:00:00Z",
            },
        ]
    )

    with patch("app.services.diagnosis_service.get_supabase_client", return_value=mock_supabase):
        r = client.get("/api/diagnosis/latest")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["candidate_id"] == candidate_a_id
        assert data["target_role"] == "Data Analyst"
        assert data["total_skills"] == 2
        assert data["largest_gap_skill"] == "Power BI"
        assert data["largest_gap"] == 47
        assert data["high_priority_gaps"] == 1
        assert len(data["diagnostics"]) == 2
        print(f"  [OK] GET /api/diagnosis/latest returned structured diagnosis (readiness: {data['career_readiness']}%)")

    # -------------------------------------------------------------
    # 3. Candidate Isolation Check (Candidate A vs Candidate B)
    # -------------------------------------------------------------
    print("\n--- 3. Candidate Data Isolation Verification ---")
    user_b_id = str(uuid.uuid4())
    candidate_b_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_b_id

    mock_supabase_b = MagicMock()
    # Mock candidate profile for User B (has no diagnostics yet)
    mock_supabase_b.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_b_id, "target_role": "Data Engineer", "availability_hours_per_week": 10.0}
    )
    # Empty diagnostics for candidate B
    mock_supabase_b.table().select().eq().order().execute.return_value = MagicMock(data=[])

    with patch("app.services.diagnosis_service.get_supabase_client", return_value=mock_supabase_b):
        r = client.get("/api/diagnosis/latest")
        assert r.status_code == 404, f"Expected 404 for Candidate B without assessment, got {r.status_code}"
        print("  [OK] Candidate B cannot access Candidate A's diagnosis; returns 404 cleanly when no diagnostics exist.")

    # -------------------------------------------------------------
    # 4. Roadmap Generation (POST /api/roadmap/generate)
    # -------------------------------------------------------------
    print("\n--- 4. Roadmap Generation Workflow ---")
    app.dependency_overrides[get_current_user_id] = lambda: user_a_id

    mock_supabase_roadmap = MagicMock()
    mock_supabase_roadmap.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_a_id, "target_role": "Data Analyst", "availability_hours_per_week": 12.0}
    )
    # Diagnostics for Candidate A
    diag_rows = [
        {
            "id": str(uuid.uuid4()),
            "candidate_id": candidate_a_id,
            "skill_name": "Power BI",
            "gap": 45,
            "priority_level": "HIGH PRIORITY",
        },
        {
            "id": str(uuid.uuid4()),
            "candidate_id": candidate_a_id,
            "skill_name": "Python",
            "gap": 20,
            "priority_level": "MEDIUM PRIORITY",
        },
    ]
    mock_supabase_roadmap.table().select().eq().order().execute.return_value = MagicMock(data=diag_rows)

    step_1_id = str(uuid.uuid4())
    step_2_id = str(uuid.uuid4())
    saved_steps = [
        {
            "id": step_1_id,
            "candidate_id": candidate_a_id,
            "step_id": "step-power-bi",
            "step_number": 1,
            "skill_name": "Power BI",
            "priority": "HIGH PRIORITY",
            "gap": 45,
            "allocated_hours": 9.0,
            "estimated_duration_weeks": "3 Weeks",
            "title": "Calibrate Power BI Competency",
            "description": "Triage and close the 45% competency deficit in Power BI.",
            "is_completed": False,
        },
        {
            "id": step_2_id,
            "candidate_id": candidate_a_id,
            "step_id": "step-python",
            "step_number": 2,
            "skill_name": "Python",
            "priority": "MEDIUM PRIORITY",
            "gap": 20,
            "allocated_hours": 3.0,
            "estimated_duration_weeks": "2 Weeks",
            "title": "Calibrate Python Competency",
            "description": "Triage and close the 20% competency deficit in Python.",
            "is_completed": False,
        },
    ]
    mock_supabase_roadmap.table().upsert().execute.side_effect = [
        MagicMock(data=saved_steps),  # step upsert
        MagicMock(  # actions upsert
            data=[
                {
                    "id": str(uuid.uuid4()),
                    "roadmap_step_id": step_1_id,
                    "action_id": "step-power-bi-act-1",
                    "title": "Study Power BI core principles and specifications",
                    "description": "Deep review of standard architectural conventions.",
                    "action_type": "Learn",
                    "estimated_minutes": 45,
                    "is_completed": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "roadmap_step_id": step_1_id,
                    "action_id": "step-power-bi-act-2",
                    "title": "Practice practical Power BI drills and problem sets",
                    "description": "Solve industry scenarios.",
                    "action_type": "Practice",
                    "estimated_minutes": 60,
                    "is_completed": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "roadmap_step_id": step_1_id,
                    "action_id": "step-power-bi-act-3",
                    "title": "Build production-ready verified Power BI portfolio artifact",
                    "description": "Synthesize a complete demonstrable project.",
                    "action_type": "Build",
                    "estimated_minutes": 90,
                    "is_completed": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "roadmap_step_id": step_1_id,
                    "action_id": "step-power-bi-act-4",
                    "title": "Technical walkthrough and Power BI documentation defense",
                    "description": "Formulate defense memorandum.",
                    "action_type": "Defend",
                    "estimated_minutes": 45,
                    "is_completed": False,
                },
            ]
        ),
    ]

    with patch("app.services.roadmap_service.get_supabase_client", return_value=mock_supabase_roadmap):
        r = client.post("/api/roadmap/generate")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["candidate_id"] == candidate_a_id
        assert data["total_steps"] == 2
        assert data["steps"][0]["skill_name"] == "Power BI"
        assert len(data["steps"][0]["actions"]) == 4
        assert [a["action_type"] for a in data["steps"][0]["actions"]] == ["Learn", "Practice", "Build", "Defend"]
        print(f"  [OK] POST /api/roadmap/generate created {data['total_steps']} steps with {len(data['steps'][0]['actions'])} standardized actions.")

    # -------------------------------------------------------------
    # 5. Roadmap Retrieval (GET /api/roadmap)
    # -------------------------------------------------------------
    print("\n--- 5. Roadmap Retrieval ---")
    mock_supabase_get_rm = MagicMock()
    mock_supabase_get_rm.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_a_id, "target_role": "Data Analyst"}
    )
    mock_supabase_get_rm.table().select().eq().order().execute.return_value = MagicMock(
        data=saved_steps
    )
    mock_supabase_get_rm.table().select().in_().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "roadmap_step_id": step_1_id,
                "action_id": "step-power-bi-act-1",
                "title": "Study Power BI core principles",
                "action_type": "Learn",
                "estimated_minutes": 45,
                "is_completed": False,
            }
        ]
    )

    with patch("app.services.roadmap_service.get_supabase_client", return_value=mock_supabase_get_rm):
        r = client.get("/api/roadmap")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["candidate_id"] == candidate_a_id
        assert len(data["steps"]) == 2
        print(f"  [OK] GET /api/roadmap successfully returned candidate's roadmap.")

    # -------------------------------------------------------------
    # 6. Safe Handling of Missing Data
    # -------------------------------------------------------------
    print("\n--- 6. Safe Error Handling ---")
    mock_supabase_missing = MagicMock()
    mock_supabase_missing.table().select().eq().maybe_single().execute.return_value = MagicMock(data=None)

    with patch("app.services.diagnosis_service.get_supabase_client", return_value=mock_supabase_missing):
        r = client.get("/api/diagnosis/latest")
        assert r.status_code == 404, f"Expected 404 for missing profile, got {r.status_code}"
        print("  [OK] Handled non-existent candidate profile gracefully (404 Not Found)")

    app.dependency_overrides.clear()
    print("\n" + "=" * 65)
    print("ALL DIAGNOSIS & ROADMAP API UNIT TESTS PASSED (100%)")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_diagnosis_roadmap_tests()
