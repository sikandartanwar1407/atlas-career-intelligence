from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityResponse,
    OpportunityUpdate,
    RequirementCreate,
    RequirementItem,
)
from app.services.employer_service import resolve_employer_profile


def _resolve_opportunity_ownership(supabase, user_id: str, opportunity_id: str) -> Dict[str, Any]:
    """Helper verifying that the authenticated user is an employer and owns the given opportunity.

    Raises 404 or 403 accordingly.
    """
    employer = resolve_employer_profile(supabase, user_id)
    employer_id = employer["id"]

    try:
        res = (
            supabase.table("opportunities")
            .select("*")
            .eq("id", opportunity_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error querying opportunity.",
        ) from exc

    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found.",
        )

    opp = res.data
    if str(opp["employer_id"]) != str(employer_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this opportunity.",
        )

    return opp


def create_opportunity(user_id: str, req: OpportunityCreate) -> OpportunityResponse:
    """Creates a new opportunity under the authenticated employer's profile."""
    supabase = get_supabase_client()
    employer = resolve_employer_profile(supabase, user_id)
    employer_id = employer["id"]

    company_name = req.company or employer["company_name"]
    logo_text = req.company_logo_text or employer.get("company_logo_text") or company_name[:2].upper()

    opp_payload = {
        "employer_id": employer_id,
        "job_title": req.job_title.strip(),
        "company": company_name.strip(),
        "company_logo_text": logo_text,
        "location": req.location.strip(),
        "employment_type": req.employment_type,
        "target_role_category": req.target_role_category.strip(),
        "experience_level": req.experience_level,
        "short_description": req.short_description.strip(),
        "full_description": req.full_description.strip(),
        "salary_range": req.salary_range.strip() if req.salary_range else None,
        "status": req.status,
        "required_evidence_types": req.required_evidence_types,
        "is_employer_posted": True,
        "posted_date": "Just now",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        insert_res = supabase.table("opportunities").insert(opp_payload).execute()
        if not insert_res or not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert opportunity record.",
            )
        new_opp = insert_res.data[0]
        opp_id = new_opp["id"]

        # Insert requirements if supplied
        requirements_items: List[RequirementItem] = []
        if req.requirements:
            req_rows = [
                {
                    "opportunity_id": opp_id,
                    "skill_name": r.skill_name.strip(),
                    "requirement_type": r.requirement_type,
                    "min_level": r.min_level,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                for r in req.requirements
            ]
            req_res = supabase.table("opportunity_requirements").insert(req_rows).execute()
            if req_res and req_res.data:
                requirements_items = [RequirementItem(**row) for row in req_res.data]

        return OpportunityResponse(
            **new_opp,
            requirements=requirements_items,
            matched_count=0,
            interested_count=0,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error creating opportunity: {str(exc)}",
        ) from exc


def get_opportunities(
    user_id: Optional[str] = None,
    my_opportunities: bool = False,
    target_role: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> List[OpportunityResponse]:
    """Lists opportunities.

    - If my_opportunities is True (and user_id is provided), returns opportunities owned by that employer.
    - Otherwise returns public/active opportunities.
    """
    supabase = get_supabase_client()

    query = supabase.table("opportunities").select("*")

    if my_opportunities and user_id:
        try:
            employer = resolve_employer_profile(supabase, user_id)
            query = query.eq("employer_id", employer["id"])
        except HTTPException:
            return []
    else:
        if status_filter:
            query = query.eq("status", status_filter)

    if target_role:
        query = query.eq("target_role_category", target_role)

    try:
        res = query.order("created_at", desc=True).execute()
        opps = res.data or []
        if not opps:
            return []

        opp_ids = [str(o["id"]) for o in opps]

        # Fetch all requirements for these opportunities in batch
        reqs_map: Dict[str, List[RequirementItem]] = {}
        try:
            req_res = (
                supabase.table("opportunity_requirements")
                .select("*")
                .in_("opportunity_id", opp_ids)
                .execute()
            )
            for r in (req_res.data or []):
                oid = str(r["opportunity_id"])
                if oid not in reqs_map:
                    reqs_map[oid] = []
                reqs_map[oid].append(RequirementItem(**r))
        except Exception as exc:
            print(f"[OpportunityService] Warning fetching requirements: {exc}")

        # Fetch application counts for interested count
        apps_count_map: Dict[str, int] = {}
        try:
            apps_res = (
                supabase.table("job_applications")
                .select("opportunity_id")
                .in_("opportunity_id", opp_ids)
                .execute()
            )
            for a in (apps_res.data or []):
                oid = str(a["opportunity_id"])
                apps_count_map[oid] = apps_count_map.get(oid, 0) + 1
        except Exception:
            pass

        results: List[OpportunityResponse] = []
        for o in opps:
            oid = str(o["id"])
            results.append(
                OpportunityResponse(
                    **o,
                    requirements=reqs_map.get(oid, []),
                    matched_count=o.get("matched_count", 0),
                    interested_count=apps_count_map.get(oid, 0),
                )
            )
        return results
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error querying opportunities: {str(exc)}",
        ) from exc


def get_opportunity_by_id(opportunity_id: str) -> OpportunityResponse:
    """Retrieves a single opportunity by ID along with its requirements."""
    supabase = get_supabase_client()
    try:
        res = (
            supabase.table("opportunities")
            .select("*")
            .eq("id", opportunity_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error querying opportunity.",
        ) from exc

    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found.",
        )

    opp = res.data
    opp_id = str(opp["id"])

    # Fetch requirements
    requirements: List[RequirementItem] = []
    try:
        req_res = (
            supabase.table("opportunity_requirements")
            .select("*")
            .eq("opportunity_id", opp_id)
            .execute()
        )
        if req_res and req_res.data:
            requirements = [RequirementItem(**r) for r in req_res.data]
    except Exception:
        pass

    # Fetch interested application count
    interested_count = 0
    try:
        apps_res = (
            supabase.table("job_applications")
            .select("id")
            .eq("opportunity_id", opp_id)
            .execute()
        )
        if apps_res and apps_res.data:
            interested_count = len(apps_res.data)
    except Exception:
        pass

    return OpportunityResponse(
        **opp,
        requirements=requirements,
        interested_count=interested_count,
    )


def update_opportunity(
    user_id: str, opportunity_id: str, req: OpportunityUpdate
) -> OpportunityResponse:
    """Updates only the specified fields on an opportunity.

    Enforces that the authenticated employer owns this opportunity.
    """
    supabase = get_supabase_client()
    _resolve_opportunity_ownership(supabase, user_id, opportunity_id)

    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if req.job_title is not None:
        updates["job_title"] = req.job_title.strip()
    if req.company is not None:
        updates["company"] = req.company.strip()
    if req.company_logo_text is not None:
        updates["company_logo_text"] = req.company_logo_text.strip()
    if req.location is not None:
        updates["location"] = req.location.strip()
    if req.employment_type is not None:
        updates["employment_type"] = req.employment_type
    if req.target_role_category is not None:
        updates["target_role_category"] = req.target_role_category.strip()
    if req.experience_level is not None:
        updates["experience_level"] = req.experience_level
    if req.short_description is not None:
        updates["short_description"] = req.short_description.strip()
    if req.full_description is not None:
        updates["full_description"] = req.full_description.strip()
    if req.salary_range is not None:
        updates["salary_range"] = req.salary_range.strip()
    if req.status is not None:
        updates["status"] = req.status
    if req.required_evidence_types is not None:
        updates["required_evidence_types"] = req.required_evidence_types

    try:
        update_res = (
            supabase.table("opportunities")
            .update(updates)
            .eq("id", opportunity_id)
            .execute()
        )
        return get_opportunity_by_id(opportunity_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating opportunity: {str(exc)}",
        ) from exc


def add_opportunity_requirement(
    user_id: str, opportunity_id: str, req: RequirementCreate
) -> RequirementItem:
    """Adds a skill requirement to an opportunity.

    Enforces opportunity ownership.
    """
    supabase = get_supabase_client()
    _resolve_opportunity_ownership(supabase, user_id, opportunity_id)

    payload = {
        "opportunity_id": opportunity_id,
        "skill_name": req.skill_name.strip(),
        "requirement_type": req.requirement_type,
        "min_level": req.min_level,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        res = (
            supabase.table("opportunity_requirements")
            .upsert(payload, on_conflict="opportunity_id,skill_name")
            .execute()
        )
        if not res or not res.data:
            # Re-fetch
            fetch_res = (
                supabase.table("opportunity_requirements")
                .select("*")
                .eq("opportunity_id", opportunity_id)
                .eq("skill_name", req.skill_name.strip())
                .maybe_single()
                .execute()
            )
            return RequirementItem(**fetch_res.data)
        return RequirementItem(**res.data[0])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error adding requirement: {str(exc)}",
        ) from exc


def get_opportunity_requirements(opportunity_id: str) -> List[RequirementItem]:
    """Retrieves all skill requirements for an opportunity."""
    supabase = get_supabase_client()
    try:
        res = (
            supabase.table("opportunity_requirements")
            .select("*")
            .eq("opportunity_id", opportunity_id)
            .execute()
        )
        return [RequirementItem(**r) for r in (res.data or [])]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error getting requirements: {str(exc)}",
        ) from exc


def delete_opportunity_requirement(
    user_id: str, opportunity_id: str, requirement_id: str
) -> bool:
    """Deletes a skill requirement from an opportunity.

    Enforces opportunity ownership.
    """
    supabase = get_supabase_client()
    _resolve_opportunity_ownership(supabase, user_id, opportunity_id)

    try:
        supabase.table("opportunity_requirements").delete().eq("id", requirement_id).eq("opportunity_id", opportunity_id).execute()
        return True
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error deleting requirement: {str(exc)}",
        ) from exc
