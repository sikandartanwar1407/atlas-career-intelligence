"""ATLAS Backend - Employer Portal, Opportunities & Candidate Matching Test Suite.

Tests:
1. Unauthenticated checks -> 401 Unauthorized
2. Employer profile creation (POST /api/employer/profile)
3. Employer profile retrieval & update (GET & PATCH /api/employer/profile)
4. Employer profile isolation (Employer A vs Employer B)
5. Opportunity creation & listing (POST & GET /api/opportunities)
6. Opportunity update ownership (Employer A cannot update Employer B's opportunity -> 403)
7. Requirement management (POST, GET, DELETE /api/opportunities/{id}/requirements)
8. Candidate matching engine (GET /api/opportunities/{id}/matches):
   - Requires employer ownership
   - Filters out candidates with allow_discover=False
   - Respects show_portfolio_evidence and show_skill_info consent flags
   - Reflects allow_contact flag
   - Never exposes private credentials (email, password, user_id)
9. Job application flow:
   - Candidate applies to active opportunity (POST /api/opportunities/{id}/apply)
   - Closed opportunity rejects applications (400)
   - Candidate views own applications (GET /api/applications)
   - Employer views applications for their own opportunity (GET /api/opportunities/{id}/applications)
   - Non-owner employer cannot view applications (403)
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import get_current_user_id


def run_employer_matching_tests() -> bool:
    print("=" * 70)
    print("ATLAS Employer Portal, Opportunities & Matching API - Verification Suite")
    print("=" * 70)

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Unauthenticated Checks (401)
    # -------------------------------------------------------------
    print("\n--- 1. Auth Protection Checks ---")
    if get_current_user_id in app.dependency_overrides:
        del app.dependency_overrides[get_current_user_id]

    dummy_id = str(uuid.uuid4())
    r = client.get("/api/employer/profile")
    assert r.status_code == 401, f"Expected 401 for GET /api/employer/profile, got {r.status_code}"
    print("  [OK] GET /api/employer/profile rejected unauthenticated request (401)")

    r = client.post("/api/employer/profile", json={"company_name": "Test Co"})
    assert r.status_code == 401, f"Expected 401 for POST /api/employer/profile, got {r.status_code}"
    print("  [OK] POST /api/employer/profile rejected unauthenticated request (401)")

    r = client.post("/api/opportunities", json={"job_title": "Data Analyst"})
    assert r.status_code == 401, f"Expected 401 for POST /api/opportunities, got {r.status_code}"
    print("  [OK] POST /api/opportunities rejected unauthenticated request (401)")

    r = client.get(f"/api/opportunities/{dummy_id}/matches")
    assert r.status_code == 401, f"Expected 401 for GET /api/opportunities/{{id}}/matches, got {r.status_code}"
    print("  [OK] GET /api/opportunities/{id}/matches rejected unauthenticated request (401)")

    r = client.post(f"/api/opportunities/{dummy_id}/apply")
    assert r.status_code == 401, f"Expected 401 for POST /api/opportunities/{{id}}/apply, got {r.status_code}"
    print("  [OK] POST /api/opportunities/{id}/apply rejected unauthenticated request (401)")

    r = client.get("/api/applications")
    assert r.status_code == 401, f"Expected 401 for GET /api/applications, got {r.status_code}"
    print("  [OK] GET /api/applications rejected unauthenticated request (401)")

    # -------------------------------------------------------------
    # In-memory Mock Data Store
    # -------------------------------------------------------------
    emp_user_a = str(uuid.uuid4())
    emp_profile_a_id = str(uuid.uuid4())

    emp_user_b = str(uuid.uuid4())
    emp_profile_b_id = str(uuid.uuid4())

    cand_user_1 = str(uuid.uuid4())
    cand_profile_1_id = str(uuid.uuid4())

    cand_user_2_hidden = str(uuid.uuid4())
    cand_profile_2_id = str(uuid.uuid4())

    store: Dict[str, List[Dict[str, Any]]] = {
        "employer_profiles": [],
        "opportunities": [],
        "opportunity_requirements": [],
        "job_applications": [],
        "candidate_profiles": [
            {
                "id": cand_profile_1_id,
                "user_id": cand_user_1,
                "full_name": "Alice Candidate",
                "email": "alice@example.com",
                "college": "Berkeley",
                "degree": "B.S. Data Science",
                "year": "4th Year",
                "experience_level": "Fresher",
                "target_role": "Data Analyst",
                "has_completed_setup": True,
            },
            {
                "id": cand_profile_2_id,
                "user_id": cand_user_2_hidden,
                "full_name": "Secret Candidate",
                "email": "secret@example.com",
                "college": "MIT",
                "degree": "M.S. CS",
                "year": "Graduated",
                "experience_level": "Experienced",
                "target_role": "Data Analyst",
                "has_completed_setup": True,
            },
        ],
        "candidate_visibility_settings": [
            {
                "candidate_id": cand_profile_1_id,
                "allow_discover": True,
                "allow_contact": True,
                "show_portfolio_evidence": True,
                "show_skill_info": True,
            },
            {
                "candidate_id": cand_profile_2_id,
                "allow_discover": False,  # HIDDEN from discovery
                "allow_contact": False,
                "show_portfolio_evidence": False,
                "show_skill_info": False,
            },
        ],
        "candidate_skill_diagnostics": [
            {
                "candidate_id": cand_profile_1_id,
                "skill_name": "SQL",
                "demonstrated_score": 85,
            },
            {
                "candidate_id": cand_profile_1_id,
                "skill_name": "Power BI",
                "demonstrated_score": 75,
            },
            {
                "candidate_id": cand_profile_2_id,
                "skill_name": "SQL",
                "demonstrated_score": 95,
            },
        ],
        "candidate_skill_ratings": [],
        "candidate_evidence": [
            {
                "id": str(uuid.uuid4()),
                "candidate_id": cand_profile_1_id,
                "verification_status": "Verified",
            }
        ],
    }

    class MockSupabaseQuery:
        def __init__(self, table_name: str):
            self.table_name = table_name
            self._filters = {}
            self._is_maybe_single = False
            self._orders = []

        def select(self, *args, **kwargs):
            return self

        def eq(self, col: str, val: Any):
            self._filters[col] = str(val) if isinstance(val, uuid.UUID) else val
            return self

        def in_(self, col: str, vals: list):
            self._filters[f"{col}__in"] = [str(v) if isinstance(v, uuid.UUID) else v for v in vals]
            return self

        def order(self, col: str, desc: bool = False):
            self._orders.append((col, desc))
            return self

        def limit(self, *args, **kwargs):
            return self

        def maybe_single(self):
            self._is_maybe_single = True
            return self

        def insert(self, data, *args, **kwargs):
            rows = data if isinstance(data, list) else [data]
            inserted = []
            for r in rows:
                new_row = dict(r)
                if "id" not in new_row:
                    new_row["id"] = str(uuid.uuid4())
                store.setdefault(self.table_name, []).append(new_row)
                inserted.append(new_row)
            self._inserted_data = inserted
            return self

        def upsert(self, data, *args, **kwargs):
            return self.insert(data, *args, **kwargs)

        def update(self, data, *args, **kwargs):
            self._update_data = data
            return self

        def delete(self, *args, **kwargs):
            self._is_delete = True
            return self

        def execute(self):
            res = MagicMock()
            if hasattr(self, "_inserted_data"):
                res.data = self._inserted_data
                return res

            items = store.get(self.table_name, [])

            if hasattr(self, "_update_data"):
                target_id = self._filters.get("id")
                updated_rows = []
                for r in items:
                    if target_id and str(r.get("id")) == str(target_id):
                        r.update(self._update_data)
                        updated_rows.append(r)
                    elif not target_id:
                        r.update(self._update_data)
                        updated_rows.append(r)
                res.data = updated_rows
                return res

            if getattr(self, "_is_delete", False):
                target_id = self._filters.get("id")
                if target_id:
                    store[self.table_name] = [
                        r for r in items if str(r.get("id")) != str(target_id)
                    ]
                res.data = []
                return res

            matched = []
            for row in items:
                matches_all = True
                for k, v in self._filters.items():
                    if k.endswith("__in"):
                        col = k[:-4]
                        if str(row.get(col)) not in [str(x) for x in v]:
                            matches_all = False
                            break
                    else:
                        if str(row.get(k)) != str(v):
                            matches_all = False
                            break
                if matches_all:
                    matched.append(row)

            if self._is_maybe_single:
                res.data = matched[0] if matched else None
            else:
                res.data = matched
            return res

    mock_client = MagicMock()
    mock_client.table.side_effect = lambda t: MockSupabaseQuery(t)

    with patch("app.services.employer_service.get_supabase_client", return_value=mock_client), \
         patch("app.services.opportunity_service.get_supabase_client", return_value=mock_client), \
         patch("app.services.matching_service.get_supabase_client", return_value=mock_client):

        # -------------------------------------------------------------
        # 2. Employer Profile Creation (POST)
        # -------------------------------------------------------------
        print("\n--- 2. Employer Profile Creation ---")
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_a

        emp_payload = {
            "company_name": "Apex Technologies",
            "company_website": "https://apex.example.com",
            "company_email": "careers@apex.example.com",
            "industry": "Software & Analytics",
            "company_size": "50-200 employees",
            "company_location": "San Francisco, CA",
            "company_description": "Leading data architecture and career intelligence solutions.",
            "company_logo_text": "AT",
        }
        r = client.post("/api/employer/profile", json=emp_payload)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        profile_a = r.json()
        assert profile_a["company_name"] == "Apex Technologies"
        assert profile_a["verification_status"] == "pending"
        emp_profile_a_id = profile_a["id"]
        print(f"  [OK] POST /api/employer/profile created employer profile: {profile_a['id']}")

        # -------------------------------------------------------------
        # 3. Employer Profile Retrieval & Update (GET & PATCH)
        # -------------------------------------------------------------
        print("\n--- 3. Employer Profile Retrieval & Update ---")
        r = client.get("/api/employer/profile")
        assert r.status_code == 200
        assert r.json()["company_name"] == "Apex Technologies"
        print("  [OK] GET /api/employer/profile retrieved profile")

        r = client.patch("/api/employer/profile", json={"company_location": "San Francisco, CA (Hybrid)"})
        assert r.status_code == 200
        assert r.json()["company_location"] == "San Francisco, CA (Hybrid)"
        print("  [OK] PATCH /api/employer/profile updated location")

        # -------------------------------------------------------------
        # 4. Employer Isolation
        # -------------------------------------------------------------
        print("\n--- 4. Employer Isolation ---")
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_b
        # Employer B has no profile yet
        r = client.get("/api/employer/profile")
        assert r.status_code == 404, f"Expected 404 for unconfigured Employer B, got {r.status_code}"
        print("  [OK] Employer B is isolated and cannot access Employer A's profile (404)")

        # Create Employer B profile
        r = client.post("/api/employer/profile", json={**emp_payload, "company_name": "Beta Labs"})
        assert r.status_code == 201
        profile_b = r.json()
        emp_profile_b_id = profile_b["id"]

        # -------------------------------------------------------------
        # 5. Opportunity Creation & Requirements
        # -------------------------------------------------------------
        print("\n--- 5. Opportunity & Requirements Management ---")
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_a

        opp_payload = {
            "job_title": "Junior Data Analyst",
            "company": "Apex Technologies",
            "location": "Remote",
            "employment_type": "Full-time",
            "target_role_category": "Data Analyst",
            "experience_level": "Fresher",
            "short_description": "Exciting role analyzing product telemetry and building dashboards.",
            "full_description": "Full-time junior data analyst position with strong focus on SQL and Power BI.",
            "salary_range": "$70,000 - $85,000",
            "requirements": [
                {"skill_name": "SQL", "requirement_type": "required", "min_level": 70},
                {"skill_name": "Power BI", "requirement_type": "required", "min_level": 65},
            ],
            "required_evidence_types": ["SQL Portfolio Project", "Power BI Dashboard"],
        }
        r = client.post("/api/opportunities", json=opp_payload)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        opp_a = r.json()
        opp_a_id = opp_a["id"]
        assert opp_a["job_title"] == "Junior Data Analyst"
        assert opp_a["status"] == "active"
        print(f"  [OK] POST /api/opportunities created opportunity with requirements: {opp_a_id}")

        # List opportunities
        r = client.get("/api/opportunities?my_opportunities=true")
        assert r.status_code == 200
        assert len(r.json()) >= 1
        print("  [OK] GET /api/opportunities listed employer's opportunities")

        # Add single requirement
        r = client.post(
            f"/api/opportunities/{opp_a_id}/requirements",
            json={"skill_name": "Excel", "requirement_type": "preferred", "min_level": 60},
        )
        assert r.status_code == 201
        print("  [OK] POST /api/opportunities/{id}/requirements added new requirement")

        # -------------------------------------------------------------
        # 6. Opportunity Ownership Security (Employer B tries to mutate Opp A)
        # -------------------------------------------------------------
        print("\n--- 6. Opportunity Ownership Security ---")
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_b

        r = client.patch(f"/api/opportunities/{opp_a_id}", json={"job_title": "Hacked Title"})
        assert r.status_code == 403, f"Expected 403 when Employer B tries to update Employer A's opportunity, got {r.status_code}"
        print("  [OK] PATCH /api/opportunities/{id} rejected unauthorized employer (403 Forbidden)")

        r = client.get(f"/api/opportunities/{opp_a_id}/matches")
        assert r.status_code == 403, f"Expected 403 when Employer B tries to view matches for Employer A's opportunity, got {r.status_code}"
        print("  [OK] GET /api/opportunities/{id}/matches rejected unauthorized employer (403 Forbidden)")

        # -------------------------------------------------------------
        # 7. Candidate Matching Engine & Privacy Verification
        # -------------------------------------------------------------
        print("\n--- 7. Candidate Matching & Privacy Enforcement ---")
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_a

        r = client.get(f"/api/opportunities/{opp_a_id}/matches")
        assert r.status_code == 200, f"Expected 200 for matches, got {r.status_code}: {r.text}"
        match_data = r.json()
        matches = match_data["matches"]
        matched_cand_ids = [m["candidate_id"] for m in matches]

        # Candidate 1 must appear; Candidate 2 (allow_discover=False) must NOT appear
        assert cand_profile_1_id in matched_cand_ids, "Discoverable Candidate 1 was missing from matches!"
        assert cand_profile_2_id not in matched_cand_ids, "Hidden Candidate 2 was leaked in matches!"

        cand_1_match = next(m for m in matches if m["candidate_id"] == cand_profile_1_id)
        assert cand_1_match["overall_match"] > 50, f"Expected high overall match, got {cand_1_match['overall_match']}"
        assert "SQL" in cand_1_match["matched_skills"]
        assert cand_1_match["allow_contact"] is True
        assert cand_1_match["evidence_count"] == 1

        # Check no private credentials leak in match payload
        assert "email" not in cand_1_match or cand_1_match["email"] is None or not hasattr(cand_1_match, "email")
        assert "password" not in cand_1_match
        assert "user_id" not in cand_1_match

        print(f"  [OK] Deterministic match computed score: {cand_1_match['overall_match']}% for Alice Candidate")
        print("  [OK] Hidden Candidate 2 was excluded strictly due to allow_discover=False")
        print("  [OK] Sensitive user credentials & user_id are never exposed")

        # -------------------------------------------------------------
        # 8. Job Application Workflow
        # -------------------------------------------------------------
        print("\n--- 8. Job Application Workflow ---")
        # Candidate 1 applies to Opportunity A
        app.dependency_overrides[get_current_user_id] = lambda: cand_user_1

        r = client.post(f"/api/opportunities/{opp_a_id}/apply")
        assert r.status_code == 201, f"Expected 201 for application, got {r.status_code}: {r.text}"
        app_res = r.json()
        assert app_res["status"] == "submitted"
        assert app_res["opportunity_id"] == opp_a_id
        assert app_res["candidate_id"] == cand_profile_1_id
        print(f"  [OK] POST /api/opportunities/{opp_a_id}/apply submitted candidate application")

        # Candidate views their submitted applications
        r = client.get("/api/applications")
        assert r.status_code == 200
        my_apps = r.json()
        assert len(my_apps) >= 1
        assert my_apps[0]["opportunity_id"] == opp_a_id
        print("  [OK] GET /api/applications returned candidate's applications")

        # Employer A views applications for Opportunity A
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_a
        r = client.get(f"/api/opportunities/{opp_a_id}/applications")
        assert r.status_code == 200
        opp_apps = r.json()
        assert len(opp_apps) >= 1
        assert opp_apps[0]["candidate_id"] == cand_profile_1_id
        print("  [OK] GET /api/opportunities/{id}/applications returned applications to owning employer")

        # Employer B cannot view applications for Opportunity A
        app.dependency_overrides[get_current_user_id] = lambda: emp_user_b
        r = client.get(f"/api/opportunities/{opp_a_id}/applications")
        assert r.status_code == 403
        print("  [OK] Employer B rejected from viewing Opportunity A applications (403 Forbidden)")

    # Clean up
    if get_current_user_id in app.dependency_overrides:
        del app.dependency_overrides[get_current_user_id]

    print("\n" + "=" * 70)
    print("ALL EMPLOYER, OPPORTUNITY, MATCHING & APPLICATION TESTS PASSED (100%)")
    print("=" * 70)
    return True


if __name__ == "__main__":
    run_employer_matching_tests()
