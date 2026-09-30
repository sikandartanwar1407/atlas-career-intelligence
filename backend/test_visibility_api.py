"""ATLAS Backend - Candidate Visibility, Discoverability & Consent Test Suite.

Tests:
1. Unauthenticated requests -> rejected (401)
2. Authenticated candidate retrieves default visibility settings when none exist
3. Authenticated candidate updates visibility & consent settings (PATCH /api/visibility)
4. Authenticated candidate retrieves updated settings (GET /api/visibility)
5. Candidate isolation: Candidate A's settings do not leak or mutate for Candidate B
6. Discovery status (GET /api/discovery/status) reflects visibility settings and profile state
7. Reusable Discovery Service (get_discoverable_candidates):
   - Excludes candidates who disabled discovery
   - Never exposes private/auth credentials (email, password, user_id)
   - Respects granular consent (portfolio/evidence and skill visibility)
"""

import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id
from app.services.visibility_service import get_discoverable_candidates


def run_visibility_tests() -> bool:
    print("=" * 65)
    print("ATLAS Candidate Visibility & Discovery API - Verification Suite")
    print("=" * 65)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Unauthenticated Checks (401)
    # -------------------------------------------------------------
    print("\n--- 1. Auth Protection Checks ---")
    if get_current_user_id in app.dependency_overrides:
        del app.dependency_overrides[get_current_user_id]

    r = client.get("/api/visibility")
    assert r.status_code == 401, f"Expected 401 for GET /api/visibility, got {r.status_code}"
    print("  [OK] GET /api/visibility rejected unauthenticated request (401)")

    r = client.patch("/api/visibility", json={"allow_discover": False})
    assert r.status_code == 401, f"Expected 401 for PATCH /api/visibility, got {r.status_code}"
    print("  [OK] PATCH /api/visibility rejected unauthenticated request (401)")

    r = client.get("/api/discovery/status")
    assert r.status_code == 401, f"Expected 401 for GET /api/discovery/status, got {r.status_code}"
    print("  [OK] GET /api/discovery/status rejected unauthenticated request (401)")

    # -------------------------------------------------------------
    # 2. Authenticated Default Settings (When no DB record exists)
    # -------------------------------------------------------------
    print("\n--- 2. Default Visibility & Consent Retrieval ---")
    user_a_id = str(uuid.uuid4())
    candidate_a_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_a_id

    # In-memory store for Supabase mock
    store = {
        "candidate_profiles": {
            user_a_id: {
                "id": candidate_a_id,
                "user_id": user_a_id,
                "full_name": "Alice Candidate",
                "target_role": "Backend Engineer",
                "experience_level": "Mid",
                "readiness_score": 82,
                "skills": ["Python", "PostgreSQL", "FastAPI"],
                "evidence_count": 3,
                "has_completed_setup": True,
            }
        },
        "candidate_visibility_settings": {},  # keyed by candidate_id
    }

    class MockSupabaseQuery:
        def __init__(self, table_name: str):
            self.table_name = table_name
            self._filters = {}
            self._is_maybe_single = False
            self._upsert_payload = None

        def select(self, *args, **kwargs):
            return self

        def eq(self, col: str, val: Any):
            self._filters[col] = val
            return self

        def limit(self, *args, **kwargs):
            return self

        def order(self, *args, **kwargs):
            return self

        def maybe_single(self):
            self._is_maybe_single = True
            return self

        def upsert(self, data, *args, **kwargs):
            self._upsert_payload = data
            cid = data.get("candidate_id")
            if cid:
                store["candidate_visibility_settings"][cid] = {
                    **store["candidate_visibility_settings"].get(cid, {}),
                    **data,
                }
            return self

        def in_(self, col: str, vals: list):
            self._filters[f"{col}__in"] = vals
            return self

        def execute(self):
            res = MagicMock()
            if self.table_name == "candidate_profiles":
                # Find by user_id, id, or id__in
                target_user = self._filters.get("user_id")
                target_cid = self._filters.get("id")
                target_in = self._filters.get("id__in")
                matched = []
                for p in store["candidate_profiles"].values():
                    if target_user and p.get("user_id") == target_user:
                        matched.append(p)
                    elif target_cid and p.get("id") == target_cid:
                        matched.append(p)
                    elif target_in and p.get("id") in target_in:
                        matched.append(p)
                    elif not target_user and not target_cid and not target_in:
                        matched.append(p)

                if self._is_maybe_single:
                    res.data = matched[0] if matched else None
                else:
                    res.data = matched
                return res

            elif self.table_name == "candidate_visibility_settings":
                cid = self._filters.get("candidate_id")
                cid_in = self._filters.get("candidate_id__in")
                disc_flag = self._filters.get("allow_discover")
                if cid:
                    record = store["candidate_visibility_settings"].get(cid)
                    if self._is_maybe_single:
                        res.data = record
                    else:
                        res.data = [record] if record else []
                elif cid_in:
                    res.data = [
                        v for v in store["candidate_visibility_settings"].values()
                        if v.get("candidate_id") in cid_in
                    ]
                elif disc_flag is not None:
                    matches = [
                        v for v in store["candidate_visibility_settings"].values()
                        if v.get("allow_discover") == disc_flag
                    ]
                    res.data = matches
                else:
                    res.data = list(store["candidate_visibility_settings"].values())
                return res

            elif self.table_name == "candidate_skill_diagnostics":
                cid_in = self._filters.get("candidate_id__in")
                res.data = [
                    {"candidate_id": cid, "skill_name": "Python", "demonstrated_score": 85}
                    for cid in (cid_in or [candidate_a_id])
                ] + [
                    {"candidate_id": cid, "skill_name": "PostgreSQL", "demonstrated_score": 78}
                    for cid in (cid_in or [candidate_a_id])
                ]
                return res

            elif self.table_name == "candidate_evidence":
                cid_in = self._filters.get("candidate_id__in")
                res.data = [
                    {"id": str(uuid.uuid4()), "candidate_id": cid, "verification_status": "Verified"}
                    for cid in (cid_in or [candidate_a_id])
                ]
                return res

            res.data = []
            return res

    mock_supabase_client = MagicMock()
    mock_supabase_client.table.side_effect = lambda t: MockSupabaseQuery(t)

    with patch("app.services.visibility_service.get_supabase_client", return_value=mock_supabase_client):
        # -------------------------------------------------------------
        # 2. GET default settings
        # -------------------------------------------------------------
        r = client.get("/api/visibility")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["allow_discover"] is True
        assert data["allow_contact"] is True
        assert data["show_portfolio_evidence"] is True
        assert data["show_skill_info"] is True
        print(f"  [OK] GET /api/visibility returned default permissive settings: {data}")

        # -------------------------------------------------------------
        # 3. Update Settings (PATCH /api/visibility)
        # -------------------------------------------------------------
        print("\n--- 3. Visibility & Consent Mutation (PATCH) ---")
        patch_payload = {
            "allow_discover": False,
            "allow_contact": False,
            "show_portfolio_evidence": False,
        }
        r = client.patch("/api/visibility", json=patch_payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        updated = r.json()
        assert updated["allow_discover"] is False
        assert updated["allow_contact"] is False
        assert updated["show_portfolio_evidence"] is False
        assert updated["show_skill_info"] is True  # preserved unchanged
        print(f"  [OK] PATCH /api/visibility successfully updated settings: {updated}")

        # Verify GET returns the persisted settings
        r = client.get("/api/visibility")
        assert r.status_code == 200
        persisted = r.json()
        assert persisted["allow_discover"] is False
        assert persisted["allow_contact"] is False
        assert persisted["show_portfolio_evidence"] is False
        assert persisted["show_skill_info"] is True
        print("  [OK] GET /api/visibility confirmed persisted state")

        # -------------------------------------------------------------
        # 4. Discovery Status Endpoint (GET /api/discovery/status)
        # -------------------------------------------------------------
        print("\n--- 4. Discovery Status Endpoint ---")
        r = client.get("/api/discovery/status")
        assert r.status_code == 200
        disc_status = r.json()
        assert disc_status["is_discoverable"] is False
        assert disc_status["allow_contact"] is False
        assert disc_status["profile_complete"] is True
        assert "paused" in disc_status["status_message"].lower() or "disabled" in disc_status["status_message"].lower()
        print(f"  [OK] GET /api/discovery/status reflects disabled state: {disc_status}")

        # Re-enable discovery and test status again
        client.patch("/api/visibility", json={"allow_discover": True, "allow_contact": True})
        r = client.get("/api/discovery/status")
        assert r.status_code == 200
        disc_status_enabled = r.json()
        assert disc_status_enabled["is_discoverable"] is True
        assert disc_status_enabled["allow_contact"] is True
        assert "discoverable" in disc_status_enabled["status_message"].lower()
        print(f"  [OK] GET /api/discovery/status reflects enabled state: {disc_status_enabled}")

        # -------------------------------------------------------------
        # 5. Candidate Isolation
        # -------------------------------------------------------------
        print("\n--- 5. Candidate Isolation ---")
        user_b_id = str(uuid.uuid4())
        candidate_b_id = str(uuid.uuid4())
        store["candidate_profiles"][user_b_id] = {
            "id": candidate_b_id,
            "user_id": user_b_id,
            "full_name": "Bob Candidate",
            "college": "Stanford",
            "degree": "B.S. CS",
            "year": "2024",
            "experience_level": "Entry",
            "target_role": "Frontend Engineer",
            "has_completed_setup": True,
        }
        # Switch auth to User B
        app.dependency_overrides[get_current_user_id] = lambda: user_b_id

        # User B should have independent default settings
        r = client.get("/api/visibility")
        assert r.status_code == 200
        data_b = r.json()
        assert data_b["allow_discover"] is True  # User B's own defaults, not User A's altered settings
        assert str(data_b["candidate_id"]) == candidate_b_id
        print("  [OK] Candidate B sees their own settings; Candidate A's state is completely isolated")

        # -------------------------------------------------------------
        # 6. Reusable Discovery Service (get_discoverable_candidates)
        # -------------------------------------------------------------
        print("\n--- 6. Reusable Discovery Service Privacy & Filtering ---")
        # Candidate A: allow_discover=True, allow_contact=True, show_portfolio_evidence=False, show_skill_info=True
        # Candidate B: set allow_discover=False
        store["candidate_visibility_settings"][candidate_b_id] = {
            "candidate_id": candidate_b_id,
            "allow_discover": False,
            "allow_contact": False,
            "show_portfolio_evidence": False,
            "show_skill_info": False,
        }

        discoverable = get_discoverable_candidates()
        candidate_ids_returned = [str(c.candidate_id) for c in discoverable]
        assert candidate_b_id not in candidate_ids_returned, "Private candidate B was leaked in discovery service!"
        assert candidate_a_id in candidate_ids_returned, "Discoverable candidate A was not returned!"

        # Candidate A has show_portfolio_evidence=False, so evidence_count should be 0
        cand_a_item = next(c for c in discoverable if str(c.candidate_id) == candidate_a_id)
        assert cand_a_item.evidence_count == 0, "Portfolio evidence leaked when show_portfolio_evidence is False!"
        assert cand_a_item.demonstrated_skills == ["Python", "PostgreSQL"]
        assert cand_a_item.allow_contact is True

        # Check no sensitive auth or email fields exist on discoverable schema
        assert not hasattr(cand_a_item, "email")
        assert not hasattr(cand_a_item, "password")
        assert not hasattr(cand_a_item, "user_id")

        print("  [OK] Discovery service excluded private Candidate B")
        print("  [OK] Discovery service respected granular consent (evidence hidden)")
        print("  [OK] Sensitive user credentials & user_id are never exposed")

    # Clean up overrides
    if get_current_user_id in app.dependency_overrides:
        del app.dependency_overrides[get_current_user_id]

    print("\n" + "=" * 65)
    print("ALL VISIBILITY & DISCOVERY API TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)
    return True


if __name__ == "__main__":
    run_visibility_tests()
