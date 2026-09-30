from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.reassessment import (
    ReassessmentHistoryResponse,
    ReassessmentItem,
    ReassessmentResponse,
    ReassessmentSubmitRequest,
)
from app.services import reassessment_service

router = APIRouter(prefix="/reassessment", tags=["Reassessment"])


@router.post(
    "",
    response_model=ReassessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Candidate Reassessment & Recalibrate Skills",
)
def create_reassessment(
    req: ReassessmentSubmitRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Submits a candidate reassessment, computes score improvements and skill deltas,

    updates skill diagnostics, adapts the career roadmap, and saves the reassessment history.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return reassessment_service.submit_reassessment(user_id=user_id, req=req)


@router.get(
    "/history",
    response_model=ReassessmentHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Longitudinal Reassessment History",
)
def get_reassessment_history(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves all historical reassessments for the authenticated candidate in chronological order.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return reassessment_service.get_reassessment_history(user_id=user_id)


@router.get(
    "/latest",
    response_model=ReassessmentItem,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Candidate Reassessment",
)
def get_latest_reassessment(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the most recent reassessment record for the authenticated candidate.

    Returns 404 if no reassessment has been completed yet.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return reassessment_service.get_latest_reassessment(user_id=user_id)
