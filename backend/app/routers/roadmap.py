from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.roadmap import RoadmapResponse
from app.services import roadmap_service

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.get(
    "",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Career Roadmap",
)
def get_candidate_roadmap(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the authenticated candidate's current career roadmap milestones and actions.

    If roadmap steps do not exist but diagnostics are present, automatically generates the roadmap.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return roadmap_service.get_candidate_roadmap(user_id=user_id)


@router.post(
    "/generate",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate / Regenerate Career Roadmap",
)
def generate_candidate_roadmap(
    user_id: str = Depends(get_current_user_id),
):
    """Generates or regenerates career roadmap milestones and actions

    from the authenticated candidate's latest skill diagnostics and weekly availability.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return roadmap_service.generate_candidate_roadmap(user_id=user_id)
