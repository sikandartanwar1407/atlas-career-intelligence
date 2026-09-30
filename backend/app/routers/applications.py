from typing import List
from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.matching import JobApplicationResponse
from app.services import matching_service

router = APIRouter(prefix="/applications", tags=["Candidate Applications"])


@router.get(
    "",
    response_model=List[JobApplicationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated Candidate's Applications",
)
def get_my_applications(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves all applications submitted by the authenticated candidate."""
    return matching_service.get_candidate_applications(user_id=user_id)
