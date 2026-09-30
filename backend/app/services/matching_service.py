from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.matching import (
    CandidateMatchItem,
    JobApplicationResponse,
    OpportunityMatchesResponse,
    SkillComparisonItem,
    SkillGapItem,
)
from app.services.employer_service import resolve_employer_profile
from app.services.opportunity_service import _resolve_opportunity_ownership


def _resolve_candidate_profile(supabase, user_id: str) -> Dict[str, Any]:
    try:
        res = (
            supabase.table("candidate_profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error querying candidate profile.",
        ) from exc

    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found.",
        )

    return res.data


def get_opportunity_matches(
    user_id: str, opportunity_id: str
) -> OpportunityMatchesResponse:
    """Computes deterministic candidate matches for an opportunity.

    Security & Privacy:
    - Enforces employer ownership of the opportunity.
    - Excludes candidates who have disabled employer discovery in candidate_visibility_settings.
    - Respects candidate granular consent for evidence and skill information.
    - Never exposes private auth info, email, password, or user_id.
    """
    supabase = get_supabase_client()
    opp = _resolve_opportunity_ownership(supabase, user_id, opportunity_id)

    # 1. Fetch Opportunity Requirements
    requirements: List[Dict[str, Any]] = []
    try:
        req_res = (
            supabase.table("opportunity_requirements")
            .select("*")
            .eq("opportunity_id", opportunity_id)
            .execute()
        )
        requirements = req_res.data or []
    except Exception as exc:
        print(f"[MatchingService] Error querying requirements: {exc}")

    # 2. Fetch candidates with completed setup
    target_role_category = opp.get("target_role_category", "")
    try:
        candidates_res = (
            supabase.table("candidate_profiles")
            .select("id, full_name, college, degree, year, experience_level, target_role, has_completed_setup")
            .eq("has_completed_setup", True)
            .execute()
        )
        candidate_profiles = candidates_res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error fetching candidates.",
        ) from exc

    if not candidate_profiles:
        return OpportunityMatchesResponse(
            opportunity_id=UUID(opportunity_id),
            job_title=opp["job_title"],
            target_role_category=target_role_category,
            total_matches=0,
            matches=[],
        )

    candidate_ids = [str(p["id"]) for p in candidate_profiles]

    # 3. Fetch candidate visibility settings
    visibility_map: Dict[str, Dict[str, Any]] = {}
    try:
        vis_res = (
            supabase.table("candidate_visibility_settings")
            .select("*")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for v in (vis_res.data or []):
            visibility_map[str(v["candidate_id"])] = v
    except Exception as exc:
        print(f"[MatchingService] Error querying visibility settings: {exc}")

    # 4. Fetch candidate skill diagnostics & ratings
    diagnostics_map: Dict[str, Dict[str, int]] = {}
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("candidate_id, skill_name, demonstrated_score")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for d in (diag_res.data or []):
            cid = str(d["candidate_id"])
            if cid not in diagnostics_map:
                diagnostics_map[cid] = {}
            diagnostics_map[cid][d["skill_name"]] = d.get("demonstrated_score", 0)
    except Exception as exc:
        print(f"[MatchingService] Error querying skill diagnostics: {exc}")

    # Fallback to candidate_skill_ratings if not assessed
    ratings_map: Dict[str, Dict[str, int]] = {}
    try:
        rate_res = (
            supabase.table("candidate_skill_ratings")
            .select("candidate_id, skill_name, baseline_score")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for r in (rate_res.data or []):
            cid = str(r["candidate_id"])
            if cid not in ratings_map:
                ratings_map[cid] = {}
            ratings_map[cid][r["skill_name"]] = r.get("baseline_score", 0)
    except Exception as exc:
        print(f"[MatchingService] Error querying skill ratings: {exc}")

    # 5. Fetch candidate evidence counts & public list
    evidence_count_map: Dict[str, int] = {}
    try:
        ev_res = (
            supabase.table("candidate_evidence")
            .select("candidate_id, verification_status")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for e in (ev_res.data or []):
            cid = str(e["candidate_id"])
            evidence_count_map[cid] = evidence_count_map.get(cid, 0) + 1
    except Exception as exc:
        print(f"[MatchingService] Error querying evidence: {exc}")

    # 6. Fetch existing applications for this opportunity
    applied_map: Dict[str, str] = {}
    try:
        app_res = (
            supabase.table("job_applications")
            .select("candidate_id, status")
            .eq("opportunity_id", opportunity_id)
            .execute()
        )
        for a in (app_res.data or []):
            applied_map[str(a["candidate_id"])] = a.get("status", "submitted")
    except Exception as exc:
        print(f"[MatchingService] Error querying applications: {exc}")

    matches: List[CandidateMatchItem] = []

    for cand in candidate_profiles:
        cid = str(cand["id"])
        vis = visibility_map.get(cid, {})

        # Privacy check 1: Candidate must not have disabled employer discovery
        if not vis.get("allow_discover", True):
            continue

        allow_contact = vis.get("allow_contact", True)
        show_portfolio_evidence = vis.get("show_portfolio_evidence", True)
        show_skill_info = vis.get("show_skill_info", True)

        # Merge demonstrated diagnostics with baseline ratings
        cand_skills = {**ratings_map.get(cid, {}), **diagnostics_map.get(cid, {})}

        # Role Category Alignment
        cand_target = (cand.get("target_role") or "").lower()
        opp_target = target_role_category.lower()
        role_alignment_bonus = (
            15
            if (cand_target and opp_target and (cand_target in opp_target or opp_target in cand_target))
            else 0
        )

        skill_comparisons: List[SkillComparisonItem] = []
        skill_gaps: List[SkillGapItem] = []
        matched_skills: List[str] = []

        total_weight = 0.0
        weighted_score = 0.0

        for req in requirements:
            req_skill = req["skill_name"]
            req_type = req.get("requirement_type", "required")
            min_lvl = req.get("min_level", 60)

            # Find candidate score by direct or fuzzy match
            cand_lvl = cand_skills.get(req_skill)
            if cand_lvl is None:
                for k, v in cand_skills.items():
                    if req_skill.lower() in k.lower() or k.lower() in req_skill.lower():
                        cand_lvl = v
                        break
            if cand_lvl is None:
                cand_lvl = 45  # unassessed default

            is_met = cand_lvl >= min_lvl
            deficit = 0 if is_met else (min_lvl - cand_lvl)

            comparison = SkillComparisonItem(
                skill=req_skill,
                candidate_level=cand_lvl,
                required_level=min_lvl,
                is_met=is_met,
                is_preferred=(req_type == "preferred"),
                deficit=deficit,
            )
            skill_comparisons.append(comparison)

            if is_met:
                matched_skills.append(req_skill)
            else:
                skill_gaps.append(
                    SkillGapItem(
                        skill=req_skill,
                        candidate_level=cand_lvl,
                        required_level=min_lvl,
                        deficit=deficit,
                    )
                )

            weight = 1.0 if req_type == "required" else 0.4
            ratio = min(cand_lvl / max(1, min_lvl), 1.25)
            total_weight += weight
            weighted_score += ratio * weight

        if total_weight > 0:
            skills_score = (weighted_score / total_weight) * 80.0
        else:
            skills_score = 65.0

        # Evidence bonus
        ev_count = evidence_count_map.get(cid, 0)
        evidence_bonus = min(ev_count * 3, 10) if show_portfolio_evidence else 0

        overall_match = int(min(100, max(10, round(skills_score + role_alignment_bonus + evidence_bonus))))

        # Top demonstrated skills for public card
        public_skills: List[str] = []
        if show_skill_info:
            for sname, sscore in cand_skills.items():
                if sscore >= 60:
                    public_skills.append(sname)

        has_applied = cid in applied_map
        app_status = applied_map.get(cid)

        match_item = CandidateMatchItem(
            candidate_id=UUID(cid),
            opportunity_id=UUID(opportunity_id),
            full_name=cand.get("full_name") or "Anonymous Candidate",
            target_role=cand.get("target_role") or "Undecided",
            experience_level=cand.get("experience_level") or "Entry",
            college=cand.get("college") or "",
            degree=cand.get("degree") or "",
            year=cand.get("year") or "",
            overall_match=overall_match,
            matched_skills=matched_skills,
            skill_gaps=skill_gaps,
            skill_comparisons=skill_comparisons,
            evidence_count=ev_count if show_portfolio_evidence else 0,
            demonstrated_skills=public_skills,
            is_discoverable=True,
            allow_contact=allow_contact,
            has_applied=has_applied,
            application_status=app_status,
        )
        matches.append(match_item)

    # Sort descending by overall_match
    matches.sort(key=lambda m: m.overall_match, reverse=True)

    return OpportunityMatchesResponse(
        opportunity_id=UUID(opportunity_id),
        job_title=opp["job_title"],
        target_role_category=target_role_category,
        total_matches=len(matches),
        matches=matches,
    )


def apply_to_opportunity(
    user_id: str, opportunity_id: str
) -> JobApplicationResponse:
    """Candidate submits application / expression of interest to an opportunity."""
    supabase = get_supabase_client()
    cand = _resolve_candidate_profile(supabase, user_id)
    candidate_id = cand["id"]

    # Check opportunity exists and is active
    try:
        opp_res = (
            supabase.table("opportunities")
            .select("id, job_title, company, status")
            .eq("id", opportunity_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error querying opportunity.",
        ) from exc

    if not opp_res or not opp_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found.",
        )

    opp = opp_res.data
    if opp.get("status") == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This opportunity is closed and no longer accepting applications.",
        )

    # Check if already applied
    try:
        existing = (
            supabase.table("job_applications")
            .select("*")
            .eq("opportunity_id", opportunity_id)
            .eq("candidate_id", candidate_id)
            .maybe_single()
            .execute()
        )
        if existing and existing.data:
            app_data = existing.data
            return JobApplicationResponse(
                id=UUID(str(app_data["id"])),
                opportunity_id=UUID(str(app_data["opportunity_id"])),
                candidate_id=UUID(str(app_data["candidate_id"])),
                status=app_data.get("status", "submitted"),
                submitted_at=datetime.fromisoformat(app_data["submitted_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(app_data["updated_at"].replace("Z", "+00:00")),
                opportunity_title=opp.get("job_title"),
                company_name=opp.get("company"),
                candidate_name=cand.get("full_name"),
                candidate_target_role=cand.get("target_role"),
            )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[MatchingService] Warning checking existing application: {exc}")

    # Insert new application
    payload = {
        "opportunity_id": opportunity_id,
        "candidate_id": candidate_id,
        "status": "submitted",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        insert_res = supabase.table("job_applications").insert(payload).execute()
        if not insert_res or not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record application.",
            )
        app_data = insert_res.data[0]
        return JobApplicationResponse(
            id=UUID(str(app_data["id"])),
            opportunity_id=UUID(str(app_data["opportunity_id"])),
            candidate_id=UUID(str(app_data["candidate_id"])),
            status=app_data.get("status", "submitted"),
            submitted_at=datetime.fromisoformat(app_data["submitted_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(app_data["updated_at"].replace("Z", "+00:00")),
            opportunity_title=opp.get("job_title"),
            company_name=opp.get("company"),
            candidate_name=cand.get("full_name"),
            candidate_target_role=cand.get("target_role"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error submitting application: {str(exc)}",
        ) from exc


def get_candidate_applications(user_id: str) -> List[JobApplicationResponse]:
    """Retrieves all applications submitted by the authenticated candidate."""
    supabase = get_supabase_client()
    cand = _resolve_candidate_profile(supabase, user_id)
    candidate_id = cand["id"]

    try:
        res = (
            supabase.table("job_applications")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("submitted_at", desc=True)
            .execute()
        )
        apps = res.data or []
        if not apps:
            return []

        opp_ids = [str(a["opportunity_id"]) for a in apps]
        opp_map: Dict[str, Dict[str, Any]] = {}
        try:
            opp_res = (
                supabase.table("opportunities")
                .select("id, job_title, company")
                .in_("id", opp_ids)
                .execute()
            )
            for o in (opp_res.data or []):
                opp_map[str(o["id"])] = o
        except Exception:
            pass

        results: List[JobApplicationResponse] = []
        for a in apps:
            opp_info = opp_map.get(str(a["opportunity_id"]), {})
            results.append(
                JobApplicationResponse(
                    id=UUID(str(a["id"])),
                    opportunity_id=UUID(str(a["opportunity_id"])),
                    candidate_id=UUID(str(a["candidate_id"])),
                    status=a.get("status", "submitted"),
                    submitted_at=datetime.fromisoformat(a["submitted_at"].replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(a["updated_at"].replace("Z", "+00:00")),
                    opportunity_title=opp_info.get("job_title"),
                    company_name=opp_info.get("company"),
                    candidate_name=cand.get("full_name"),
                    candidate_target_role=cand.get("target_role"),
                )
            )
        return results
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error retrieving applications: {str(exc)}",
        ) from exc


def get_opportunity_applications(
    user_id: str, opportunity_id: str
) -> List[JobApplicationResponse]:
    """Employer retrieves applications for their owned opportunity."""
    supabase = get_supabase_client()
    opp = _resolve_opportunity_ownership(supabase, user_id, opportunity_id)

    try:
        res = (
            supabase.table("job_applications")
            .select("*")
            .eq("opportunity_id", opportunity_id)
            .order("submitted_at", desc=True)
            .execute()
        )
        apps = res.data or []
        if not apps:
            return []

        cand_ids = [str(a["candidate_id"]) for a in apps]
        cand_map: Dict[str, Dict[str, Any]] = {}
        vis_map: Dict[str, Dict[str, Any]] = {}

        try:
            cand_res = (
                supabase.table("candidate_profiles")
                .select("id, full_name, target_role")
                .in_("id", cand_ids)
                .execute()
            )
            for c in (cand_res.data or []):
                cand_map[str(c["id"])] = c

            vis_res = (
                supabase.table("candidate_visibility_settings")
                .select("candidate_id, allow_contact")
                .in_("candidate_id", cand_ids)
                .execute()
            )
            for v in (vis_res.data or []):
                vis_map[str(v["candidate_id"])] = v
        except Exception:
            pass

        results: List[JobApplicationResponse] = []
        for a in apps:
            cid = str(a["candidate_id"])
            cinfo = cand_map.get(cid, {})
            vinfo = vis_map.get(cid, {})
            results.append(
                JobApplicationResponse(
                    id=UUID(str(a["id"])),
                    opportunity_id=UUID(str(a["opportunity_id"])),
                    candidate_id=UUID(str(a["candidate_id"])),
                    status=a.get("status", "submitted"),
                    submitted_at=datetime.fromisoformat(a["submitted_at"].replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(a["updated_at"].replace("Z", "+00:00")),
                    opportunity_title=opp.get("job_title"),
                    company_name=opp.get("company"),
                    candidate_name=cinfo.get("full_name", "Applicant"),
                    candidate_target_role=cinfo.get("target_role"),
                    allow_contact=vinfo.get("allow_contact", True),
                )
            )
        return results
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error retrieving opportunity applications: {str(exc)}",
        ) from exc
