from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.assessment import AssessmentSubmitRequest, AssessmentSubmissionResponse
from app.services import assessment_service

router = APIRouter(prefix="/assessment", tags=["Assessment"])


@router.post(
    "/submit",
    response_model=AssessmentSubmissionResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Assessment Answers & Calibrate Scores",
)
def submit_candidate_assessment(
    req: AssessmentSubmitRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Evaluates assessment answers, updates demonstrated skill scores and diagnostics,

    and saves records in assessment_submissions, assessment_answers, and candidate_skill_diagnostics.
    The candidate identity is derived strictly from the Bearer token.
    """
    return assessment_service.submit_assessment(user_id=user_id, req=req)


@router.get(
    "/latest",
    response_model=AssessmentSubmissionResponse,
    summary="Get Latest Assessment Result & Diagnostics",
)
def get_latest_candidate_assessment(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the latest assessment submission and calibrated skill diagnostics

    for the authenticated candidate.
    """
    return assessment_service.get_latest_assessment(user_id=user_id)
