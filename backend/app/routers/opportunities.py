from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.dependencies.auth import get_current_user_id
from app.schemas.matching import JobApplicationResponse, OpportunityMatchesResponse
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityResponse,
    OpportunityUpdate,
    RequirementCreate,
    RequirementItem,
)
from app.services import matching_service, opportunity_service

router = APIRouter(prefix="/opportunities", tags=["Opportunities & Matching"])


@router.post(
    "",
    response_model=OpportunityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Employer Opportunity",
)
def create_opportunity(
    req: OpportunityCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Creates a new opportunity under the authenticated employer profile."""
    return opportunity_service.create_opportunity(user_id=user_id, req=req)


@router.get(
    "",
    response_model=List[OpportunityResponse],
    status_code=status.HTTP_200_OK,
    summary="List Opportunities",
)
def list_opportunities(
    my_opportunities: bool = Query(False, description="Filter for opportunities owned by authenticated employer"),
    target_role: Optional[str] = Query(None, description="Filter by target role category"),
    status: Optional[str] = Query(None, description="Filter by active or closed status"),
    user_id: Optional[str] = Depends(get_current_user_id),
):
    """Lists opportunities.

    If my_opportunities is true, returns opportunities posted by the authenticated employer.
    """
    return opportunity_service.get_opportunities(
        user_id=user_id,
        my_opportunities=my_opportunities,
        target_role=target_role,
        status_filter=status,
    )


@router.get(
    "/{opportunity_id}",
    response_model=OpportunityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Opportunity Details",
)
def get_opportunity(
    opportunity_id: str,
):
    """Retrieves detailed opportunity info along with required competencies."""
    return opportunity_service.get_opportunity_by_id(opportunity_id=opportunity_id)


@router.patch(
    "/{opportunity_id}",
    response_model=OpportunityResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Opportunity",
)
def update_opportunity(
    opportunity_id: str,
    req: OpportunityUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Updates opportunity fields.

    Enforces that only the owning employer can update.
    """
    return opportunity_service.update_opportunity(
        user_id=user_id, opportunity_id=opportunity_id, req=req
    )


# --- Requirements Endpoints ---


@router.post(
    "/{opportunity_id}/requirements",
    response_model=RequirementItem,
    status_code=status.HTTP_201_CREATED,
    summary="Add Skill Requirement to Opportunity",
)
def add_requirement(
    opportunity_id: str,
    req: RequirementCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Adds a required or preferred skill threshold to an employer's opportunity."""
    return opportunity_service.add_opportunity_requirement(
        user_id=user_id, opportunity_id=opportunity_id, req=req
    )


@router.get(
    "/{opportunity_id}/requirements",
    response_model=List[RequirementItem],
    status_code=status.HTTP_200_OK,
    summary="Get Skill Requirements for Opportunity",
)
def get_requirements(
    opportunity_id: str,
):
    """Retrieves all skill requirements for an opportunity."""
    return opportunity_service.get_opportunity_requirements(opportunity_id=opportunity_id)


@router.delete(
    "/{opportunity_id}/requirements/{requirement_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Skill Requirement",
)
def delete_requirement(
    opportunity_id: str,
    requirement_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Deletes a skill requirement from an employer's opportunity."""
    opportunity_service.delete_opportunity_requirement(
        user_id=user_id, opportunity_id=opportunity_id, requirement_id=requirement_id
    )
    return {"message": "Requirement successfully deleted"}


# --- Matching Endpoint ---


@router.get(
    "/{opportunity_id}/matches",
    response_model=OpportunityMatchesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Matched Candidates for Opportunity",
)
def get_matches(
    opportunity_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Computes deterministic candidate matches for an opportunity.

    Enforces employer ownership and candidate visibility/privacy settings.
    """
    return matching_service.get_opportunity_matches(
        user_id=user_id, opportunity_id=opportunity_id
    )


# --- Applications Endpoints ---


@router.post(
    "/{opportunity_id}/apply",
    response_model=JobApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Candidate Applies to Opportunity",
)
def apply_to_opportunity(
    opportunity_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Candidate submits application / expression of interest to an active opportunity."""
    return matching_service.apply_to_opportunity(
        user_id=user_id, opportunity_id=opportunity_id
    )


@router.get(
    "/{opportunity_id}/applications",
    response_model=List[JobApplicationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Applications for Opportunity",
)
def get_opportunity_applications(
    opportunity_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Employer retrieves all applications submitted to their opportunity."""
    return matching_service.get_opportunity_applications(
        user_id=user_id, opportunity_id=opportunity_id
    )
