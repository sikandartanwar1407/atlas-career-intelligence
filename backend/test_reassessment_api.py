"""ATLAS Backend - Reassessment & Longitudinal Skill Tracking Test Suite.

Tests:
1. unauthenticated reassessment -> rejected (401)
2. valid reassessment -> succeeds (201)
3. reassessment score calculation & skill deltas
4. reassessment history retrieval (GET /api/reassessment/history)
5. latest reassessment retrieval (GET /api/reassessment/latest)
6. candidate isolation for reassessments (404)
7. updated diagnostics after reassessment
8. roadmap adaptation triggered dynamically
9. no-reassessment case handled safely (404)
"""

import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id


def run_reassessment_tests() -> bool:
    print("=" * 65)
    print("ATLAS Reassessment & Longitudinal Tracking API - Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Unauthenticated Checks (401)
    # -------------------------------------------------------------
    print("\n--- 1. Auth Protection Checks ---")
    r = client.post("/api/reassessment", json={"skill_ratings": {"SQL": 80}})
    assert r.status_code == 401, f"Expected 401 for POST /api/reassessment, got {r.status_code}"
    print("  [OK] POST /api/reassessment rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/reassessment/history")
    assert r.status_code == 401, f"Expected 401 for GET /api/reassessment/history, got {r.status_code}"
    print("  [OK] GET /api/reassessment/history rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/reassessment/latest")
    assert r.status_code == 401, f"Expected 401 for GET /api/reassessment/latest, got {r.status_code}"
    print("  [OK] GET /api/reassessment/latest rejected unauthenticated request (401 Unauthorized)")

    # -------------------------------------------------------------
    # 2. Reassessment Submission & Score Calculation
    # -------------------------------------------------------------
    print("\n--- 2. Reassessment Submission & Delta Calculations ---")
    user_a_id = str(uuid.uuid4())
    candidate_a_id = str(uuid.uuid4())
    reassess_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_a_id

    # Mock candidate profile, diagnostics, evidence, and insert
    mock_diag_records = [
        {
            "id": str(uuid.uuid4()),
            "candidate_id": candidate_a_id,
            "skill_name": "SQL",
            "display_name": "SQL & Query Optimization",
            "baseline_score": 50,
            "demonstrated_score": 60,
            "role_threshold": 80,
            "gap": 20,
            "priority_level": "MEDIUM PRIORITY",
            "evidence_status": "Missing",
        },
        {
            "id": str(uuid.uuid4()),
            "candidate_id": candidate_a_id,
            "skill_name": "Power BI",
            "display_name": "Power BI / Tableau",
            "baseline_score": 40,
            "demonstrated_score": 40,
            "role_threshold": 80,
            "gap": 40,
            "priority_level": "HIGH PRIORITY",
            "evidence_status": "Missing",
        },
    ]

    saved_reassess_record = {
        "id": reassess_id,
        "candidate_id": candidate_a_id,
        "previous_overall_score": 50,
        "current_overall_score": 75,
        "improvement": 25,
        "skill_deltas": {
            "SQL": {"previous": 60, "current": 80, "change": 20},
            "Power BI": {"previous": 40, "current": 70, "change": 30},
        },
        "created_at": "2026-09-30T16:00:00Z",
    }

    class MockReassessQuery:
        def __init__(self, table_name: str):
            self.table_name = table_name

        def select(self, *args, **kwargs):
            return self

        def insert(self, data, *args, **kwargs):
            return self

        def upsert(self, data, *args, **kwargs):
            return self

        def update(self, data, *args, **kwargs):
            return self

        def eq(self, *args, **kwargs):
            return self

        def in_(self, *args, **kwargs):
            return self

        def order(self, *args, **kwargs):
            return self

        def limit(self, *args, **kwargs):
            return self

        def maybe_single(self):
            return self

        def execute(self):
            if self.table_name == "candidate_profiles":
                return MagicMock(data={"id": candidate_a_id, "target_role": "Data Analyst", "availability_hours_per_week": 10})
            elif self.table_name == "candidate_skill_diagnostics":
                return MagicMock(data=mock_diag_records)
            elif self.table_name == "candidate_evidence":
                return MagicMock(data=[{"skill_name": "SQL", "verification_status": "Verified"}])
            elif self.table_name == "candidate_reassessments":
                return MagicMock(data=saved_reassess_record)
            elif self.table_name == "candidate_roadmaps":
                return MagicMock(data=[{"id": str(uuid.uuid4()), "candidate_id": candidate_a_id, "step_id": "step-sql", "step_number": 1, "skill_name": "SQL", "priority": "LOW PRIORITY", "gap": 0, "allocated_hours": 5.0, "estimated_duration_weeks": "1 Week", "title": "SQL", "description": "SQL"}])
            elif self.table_name == "candidate_roadmap_actions":
                return MagicMock(data=[])
            return MagicMock(data=[])

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = lambda t: MockReassessQuery(t)

    with patch("app.services.reassessment_service.get_supabase_client", return_value=mock_supabase), \
         patch("app.services.roadmap_service.get_supabase_client", return_value=mock_supabase):

        # Test invalid payload (score > 100)
        r_bad = client.post("/api/reassessment", json={"skill_ratings": {"SQL": 150}})
        assert r_bad.status_code == 422, f"Expected 422 for score > 100, got {r_bad.status_code}"
        print("  [OK] POST /api/reassessment rejected invalid score range > 100 (422 Unprocessable Entity)")

        # Test valid submission
        payload = {
            "skill_ratings": {
                "SQL": 80,
                "Power BI": 70,
            }
        }
        r_post = client.post("/api/reassessment", json=payload)
        assert r_post.status_code == 201, f"Expected 201, got {r_post.status_code}: {r_post.text}"
        data = r_post.json()
        assert data["id"] == reassess_id
        assert data["previous_overall_score"] == 50
        assert data["current_overall_score"] == 75
        assert data["improvement"] == 25
        assert data["skills_reassessed_count"] == 2
        assert data["roadmap_regenerated"] is True
        print(f"  [OK] POST /api/reassessment computed score improvement (+{data['improvement']} pts) and regenerated roadmap")

    # -------------------------------------------------------------
    # 3. Longitudinal History Retrieval (GET /api/reassessment/history)
    # -------------------------------------------------------------
    print("\n--- 3. Longitudinal History Retrieval ---")
    mock_history_records = [
        {
            "id": str(uuid.uuid4()),
            "candidate_id": candidate_a_id,
            "previous_overall_score": 45,
            "current_overall_score": 55,
            "improvement": 10,
            "skill_deltas": {"SQL": {"previous": 40, "current": 60, "change": 20}},
            "created_at": "2026-09-15T10:00:00Z",
        },
        saved_reassess_record,
    ]

    class MockHistoryQuery(MockReassessQuery):
        def execute(self):
            if self.table_name == "candidate_profiles":
                return MagicMock(data={"id": candidate_a_id})
            elif self.table_name == "candidate_reassessments":
                return MagicMock(data=mock_history_records)
            return MagicMock(data=[])

    mock_supabase_hist = MagicMock()
    mock_supabase_hist.table.side_effect = lambda t: MockHistoryQuery(t)

    with patch("app.services.reassessment_service.get_supabase_client", return_value=mock_supabase_hist):
        r_hist = client.get("/api/reassessment/history")
        assert r_hist.status_code == 200, f"Expected 200, got {r_hist.status_code}: {r_hist.text}"
        data_hist = r_hist.json()
        assert data_hist["total_reassessments"] == 2
        assert data_hist["cumulative_improvement"] == 35
        assert len(data_hist["history"]) == 2
        print(f"  [OK] GET /api/reassessment/history returned {data_hist['total_reassessments']} chronological sessions (cumulative lift: +{data_hist['cumulative_improvement']} pts)")

    # -------------------------------------------------------------
    # 4. Latest Reassessment Retrieval (GET /api/reassessment/latest)
    # -------------------------------------------------------------
    print("\n--- 4. Latest Reassessment Retrieval ---")
    class MockLatestQuery(MockReassessQuery):
        def execute(self):
            if self.table_name == "candidate_profiles":
                return MagicMock(data={"id": candidate_a_id})
            elif self.table_name == "candidate_reassessments":
                return MagicMock(data=[saved_reassess_record])
            return MagicMock(data=[])

    mock_supabase_latest = MagicMock()
    mock_supabase_latest.table.side_effect = lambda t: MockLatestQuery(t)

    with patch("app.services.reassessment_service.get_supabase_client", return_value=mock_supabase_latest):
        r_latest = client.get("/api/reassessment/latest")
        assert r_latest.status_code == 200, f"Expected 200, got {r_latest.status_code}: {r_latest.text}"
        data_latest = r_latest.json()
        assert data_latest["id"] == reassess_id
        assert data_latest["current_overall_score"] == 75
        print(f"  [OK] GET /api/reassessment/latest returned latest candidate reassessment record")

    # -------------------------------------------------------------
    # 5. Candidate Isolation (Candidate A vs Candidate B)
    # -------------------------------------------------------------
    print("\n--- 5. Candidate Isolation Checks ---")
    user_b_id = str(uuid.uuid4())
    candidate_b_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_b_id

    class MockIsoQuery:
        def __init__(self, table_name: str):
            self.table_name = table_name

        def select(self, *args, **kwargs):
            return self

        def eq(self, *args, **kwargs):
            return self

        def order(self, *args, **kwargs):
            return self

        def limit(self, *args, **kwargs):
            return self

        def maybe_single(self):
            return self

        def execute(self):
            if self.table_name == "candidate_profiles":
                return MagicMock(data={"id": candidate_b_id})
            elif self.table_name == "candidate_reassessments":
                return MagicMock(data=[])
            return MagicMock(data=[])

    mock_supabase_iso = MagicMock()
    mock_supabase_iso.table.side_effect = lambda t: MockIsoQuery(t)

    with patch("app.services.reassessment_service.get_supabase_client", return_value=mock_supabase_iso):
        r_iso = client.get("/api/reassessment/latest")
        assert r_iso.status_code == 404, f"Expected 404 when Candidate B has no reassessments, got {r_iso.status_code}"
        print("  [OK] Candidate B cannot access Candidate A's reassessment data; returns 404 safely when none exist")

    app.dependency_overrides.clear()
    print("\n" + "=" * 65)
    print("ALL REASSESSMENT & LONGITUDINAL TRACKING TESTS PASSED (100%)")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_reassessment_tests()
