"""ATLAS Backend - Resource Tracking, Evidence Locker & Roadmap Action Completion Test Suite.

Tests:
1. unauthenticated roadmap action update -> rejected (401)
2. valid roadmap action update -> succeeds (200)
3. candidate isolation for roadmap actions (404)
4. unauthenticated resource request -> rejected (401)
5. resource status update -> succeeds (200)
6. unauthenticated evidence request -> rejected (401)
7. evidence creation -> succeeds (201)
8. evidence retrieval -> succeeds (200)
9. candidate isolation for evidence (404)
10. evidence update -> succeeds (200)
11. unsupported/malformed evidence payload -> validation error (422)
12. GitHub analysis record association -> succeeds (201)
"""

import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id


def run_resources_evidence_tests() -> bool:
    print("=" * 65)
    print("ATLAS Resources & Evidence Locker API - Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Unauthenticated Checks (401)
    # -------------------------------------------------------------
    print("\n--- 1. Auth Protection Checks ---")
    r = client.patch("/api/roadmap/actions/act-test-01", json={"is_completed": True})
    assert r.status_code == 401, f"Expected 401 for PATCH roadmap action, got {r.status_code}"
    print("  [OK] PATCH /api/roadmap/actions/{id} rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/resources/status")
    assert r.status_code == 401, f"Expected 401 for GET resource status, got {r.status_code}"
    print("  [OK] GET /api/resources/status rejected unauthenticated request (401 Unauthorized)")

    r = client.patch("/api/resources/status/res-sql-01", json={"is_started": True})
    assert r.status_code == 401, f"Expected 401 for PATCH resource status, got {r.status_code}"
    print("  [OK] PATCH /api/resources/status/{id} rejected unauthenticated request (401 Unauthorized)")

    r = client.get("/api/evidence")
    assert r.status_code == 401, f"Expected 401 for GET evidence, got {r.status_code}"
    print("  [OK] GET /api/evidence rejected unauthenticated request (401 Unauthorized)")

    r = client.post("/api/evidence", json={"title": "Test"})
    assert r.status_code == 401, f"Expected 401 for POST evidence, got {r.status_code}"
    print("  [OK] POST /api/evidence rejected unauthenticated request (401 Unauthorized)")

    # -------------------------------------------------------------
    # 2. Roadmap Action Completion & Candidate Isolation
    # -------------------------------------------------------------
    print("\n--- 2. Roadmap Action Completion & Isolation ---")
    user_a_id = str(uuid.uuid4())
    candidate_a_id = str(uuid.uuid4())
    step_1_id = str(uuid.uuid4())
    action_1_uuid = str(uuid.uuid4())
    action_1_str_id = "step-power-bi-act-1"

    app.dependency_overrides[get_current_user_id] = lambda: user_a_id

    mock_supabase_act = MagicMock()
    # Mock profile lookup
    mock_supabase_act.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_a_id}
    )
    # Mock candidate roadmaps steps
    mock_supabase_act.table().select().eq().execute.return_value = MagicMock(
        data=[{"id": step_1_id, "candidate_id": candidate_a_id}]
    )
    # Mock actions query
    mock_supabase_act.table().select().in_().execute.return_value = MagicMock(
        data=[
            {
                "id": action_1_uuid,
                "roadmap_step_id": step_1_id,
                "action_id": action_1_str_id,
                "title": "Study Power BI DAX",
                "description": "Learn DAX formulas",
                "action_type": "Learn",
                "estimated_minutes": 45,
                "is_completed": False,
                "completed_at": None,
            }
        ]
    )
    # Mock update
    mock_supabase_act.table().update().eq().execute.return_value = MagicMock(
        data=[
            {
                "id": action_1_uuid,
                "roadmap_step_id": step_1_id,
                "action_id": action_1_str_id,
                "title": "Study Power BI DAX",
                "description": "Learn DAX formulas",
                "action_type": "Learn",
                "estimated_minutes": 45,
                "is_completed": True,
                "completed_at": "2026-09-30T14:00:00Z",
            }
        ]
    )

    with patch("app.services.roadmap_service.get_supabase_client", return_value=mock_supabase_act):
        # Successful toggle
        r = client.patch(f"/api/roadmap/actions/{action_1_str_id}", json={"is_completed": True})
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["action_id"] == action_1_str_id
        assert data["is_completed"] is True
        print("  [OK] PATCH /api/roadmap/actions/{action_id} successfully marked action complete")

        # Isolation check: Action not belonging to candidate
        r_iso = client.patch("/api/roadmap/actions/foreign-act-999", json={"is_completed": True})
        assert r_iso.status_code == 404, f"Expected 404 for foreign action, got {r_iso.status_code}"
        print("  [OK] Candidate isolation: non-owned roadmap action returned 404 Not Found")

    # -------------------------------------------------------------
    # 3. Learning Resource Status Tracking
    # -------------------------------------------------------------
    print("\n--- 3. Learning Resource Status Tracking ---")
    mock_supabase_res = MagicMock()
    mock_supabase_res.table().select().eq().maybe_single().execute.side_effect = [
        MagicMock(data={"id": candidate_a_id}),  # profile lookup for GET
        MagicMock(data={"id": candidate_a_id}),  # profile lookup for PATCH
        MagicMock(data=None),  # existing check for PATCH (new resource)
    ]
    mock_supabase_res.table().select().eq().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "candidate_id": candidate_a_id,
                "resource_id": "res-sql-01",
                "is_started": True,
                "is_completed": False,
                "started_at": "2026-09-30T10:00:00Z",
                "completed_at": None,
                "updated_at": "2026-09-30T10:00:00Z",
            }
        ]
    )
    mock_supabase_res.table().upsert().execute.return_value = MagicMock(
        data=[
            {
                "id": str(uuid.uuid4()),
                "candidate_id": candidate_a_id,
                "resource_id": "res-sql-02",
                "is_started": True,
                "is_completed": False,
                "started_at": "2026-09-30T14:30:00Z",
                "completed_at": None,
                "updated_at": "2026-09-30T14:30:00Z",
            }
        ]
    )

    with patch("app.services.resource_service.get_supabase_client", return_value=mock_supabase_res):
        # GET resource statuses
        r = client.get("/api/resources/status")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["candidate_id"] == candidate_a_id
        assert data["total_tracked"] == 1
        assert data["started_count"] == 1
        print("  [OK] GET /api/resources/status returned candidate resource tracking telemetry")

        # PATCH update resource status
        r_upd = client.patch("/api/resources/status/res-sql-02", json={"is_started": True})
        assert r_upd.status_code == 200, f"Expected 200, got {r_upd.status_code}: {r_upd.text}"
        data_upd = r_upd.json()
        assert data_upd["resource_id"] == "res-sql-02"
        assert data_upd["is_started"] is True
        print("  [OK] PATCH /api/resources/status/{resource_id} successfully persisted resource status")

    # -------------------------------------------------------------
    # 4. Evidence Locker CRUD & Validation
    # -------------------------------------------------------------
    print("\n--- 4. Evidence Locker CRUD & Validations ---")
    mock_ev_id = str(uuid.uuid4())

    # 4a. Malformed payload validation
    r_bad = client.post(
        "/api/evidence",
        json={"title": "Missing required fields", "evidence_type": "InvalidType"},
    )
    assert r_bad.status_code == 422, f"Expected 422 for invalid evidence payload, got {r_bad.status_code}"
    print("  [OK] POST /api/evidence rejected invalid enum type and missing fields (422 Unprocessable Entity)")

    # 4b-4e Setup Mock for Evidence CRUD
    mock_ev_record = {
        "id": mock_ev_id,
        "candidate_id": candidate_a_id,
        "title": "E-Commerce Cohort SQL Script",
        "skill_name": "SQL",
        "evidence_type": "Project",
        "description": "Production retention analysis script",
        "link": "https://github.com/candidate/sql-cohort",
        "date": "2026-09-30",
        "verification_status": "Submitted",
        "metrics": "Analyzed 500k rows",
        "sha_hash": "SHA-256: 4f8a...92bc",
        "evaluator_feedback": None,
        "is_public": True,
        "created_at": "2026-09-30T10:00:00Z",
        "updated_at": "2026-09-30T10:00:00Z",
    }
    mock_ev_updated = {
        **mock_ev_record,
        "title": "E-Commerce Cohort SQL Script (Updated)",
        "verification_status": "Verified",
        "metrics": "Analyzed 500k rows with index tuning",
        "updated_at": "2026-09-30T15:00:00Z",
    }

    class MockTableQuery:
        def __init__(self, table_name: str):
            self.table_name = table_name
            self._is_update = False

        def select(self, *args, **kwargs):
            return self

        def insert(self, data, *args, **kwargs):
            return self

        def update(self, data, *args, **kwargs):
            self._is_update = True
            return self

        def upsert(self, data, *args, **kwargs):
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
                return MagicMock(data={"id": candidate_a_id})
            elif self.table_name == "candidate_evidence":
                if self._is_update:
                    return MagicMock(data=mock_ev_updated)
                return MagicMock(data=mock_ev_record)
            return MagicMock(data=[])

    mock_supabase_ev = MagicMock()
    mock_supabase_ev.table.side_effect = lambda t: MockTableQuery(t)

    with patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase_ev):
        # 4b. Create evidence
        ev_payload = {
            "title": "E-Commerce Cohort SQL Script",
            "skill_name": "SQL",
            "evidence_type": "Project",
            "description": "Production retention analysis script",
            "link": "https://github.com/candidate/sql-cohort",
            "metrics": "Analyzed 500k rows",
            "sha_hash": "SHA-256: 4f8a...92bc",
        }
        r_create = client.post("/api/evidence", json=ev_payload)
        assert r_create.status_code == 201, f"Expected 201, got {r_create.status_code}: {r_create.text}"
        ev_data = r_create.json()
        assert ev_data["id"] == mock_ev_id
        assert ev_data["verification_status"] == "Submitted"
        print("  [OK] POST /api/evidence created candidate evidence record (201 Created)")

        # 4c. List evidence
        r_list = client.get("/api/evidence")
        assert r_list.status_code == 200, f"Expected 200, got {r_list.status_code}: {r_list.text}"
        list_data = r_list.json()
        assert list_data["total_count"] == 1
        print("  [OK] GET /api/evidence returned candidate's evidence list")

        # 4d. Get single evidence
        r_get = client.get(f"/api/evidence/{mock_ev_id}")
        assert r_get.status_code == 200, f"Expected 200, got {r_get.status_code}: {r_get.text}"
        print("  [OK] GET /api/evidence/{id} retrieved candidate evidence item")

        # 4e. Update evidence
        r_patch = client.patch(
            f"/api/evidence/{mock_ev_id}",
            json={
                "title": "E-Commerce Cohort SQL Script (Updated)",
                "verification_status": "Verified",
                "metrics": "Analyzed 500k rows with index tuning",
            },
        )
        assert r_patch.status_code == 200, f"Expected 200, got {r_patch.status_code}: {r_patch.text}"
        upd_ev = r_patch.json()
        assert upd_ev["title"] == "E-Commerce Cohort SQL Script (Updated)"
        assert upd_ev["verification_status"] == "Verified"
        print("  [OK] PATCH /api/evidence/{id} successfully updated evidence metadata & status")

    # -------------------------------------------------------------
    # 5. Candidate Isolation on Evidence (Candidate A vs Candidate B)
    # -------------------------------------------------------------
    print("\n--- 5. Candidate Evidence Isolation ---")
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

        def maybe_single(self):
            return self

        def execute(self):
            if self.table_name == "candidate_profiles":
                return MagicMock(data={"id": candidate_b_id})
            elif self.table_name == "candidate_evidence":
                return MagicMock(data=None)
            return MagicMock(data=None)

    mock_supabase_iso = MagicMock()
    mock_supabase_iso.table.side_effect = lambda t: MockIsoQuery(t)

    with patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase_iso):
        r_b = client.get(f"/api/evidence/{mock_ev_id}")
        assert r_b.status_code == 404, f"Expected 404 when Candidate B accesses Candidate A's evidence, got {r_b.status_code}"
        print("  [OK] Candidate B cannot read Candidate A's evidence (404 Not Found)")

    # -------------------------------------------------------------
    # 6. GitHub Analysis Telemetry Association
    # -------------------------------------------------------------
    print("\n--- 6. GitHub Analysis Telemetry ---")
    app.dependency_overrides[get_current_user_id] = lambda: user_a_id
    mock_gh_id = str(uuid.uuid4())

    mock_supabase_gh = MagicMock()
    mock_supabase_gh.table().select().eq().maybe_single().execute.return_value = MagicMock(
        data={"id": candidate_a_id}
    )
    mock_supabase_gh.table().insert().execute.return_value = MagicMock(
        data=[
            {
                "id": mock_gh_id,
                "candidate_id": candidate_a_id,
                "github_username": "octocat",
                "github_user_data": {"public_repos": 12},
                "analyzed_repos_count": 8,
                "primary_languages": ["Python", "SQL"],
                "detected_topics": ["data-analysis", "postgresql"],
                "demonstrated_skills_detected": ["SQL", "Python"],
                "evidence_readiness_boost": 8,
                "extracted_evidence_count": 3,
                "raw_analysis_payload": {},
                "created_at": "2026-09-30T10:00:00Z",
            }
        ]
    )

    with patch("app.services.evidence_service.get_supabase_client", return_value=mock_supabase_gh):
        gh_payload = {
            "github_username": "octocat",
            "github_user_data": {"public_repos": 12},
            "analyzed_repos_count": 8,
            "primary_languages": ["Python", "SQL"],
            "detected_topics": ["data-analysis", "postgresql"],
            "demonstrated_skills_detected": ["SQL", "Python"],
            "evidence_readiness_boost": 8,
            "extracted_evidence_count": 3,
        }
        r_gh = client.post("/api/evidence/github", json=gh_payload)
        assert r_gh.status_code == 201, f"Expected 201, got {r_gh.status_code}: {r_gh.text}"
        data_gh = r_gh.json()
        assert data_gh["github_username"] == "octocat"
        assert data_gh["candidate_id"] == candidate_a_id
        print("  [OK] POST /api/evidence/github associated telemetry with authenticated candidate")

    app.dependency_overrides.clear()
    print("\n" + "=" * 65)
    print("ALL RESOURCES & EVIDENCE LOCKER API TESTS PASSED (100%)")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_resources_evidence_tests()
