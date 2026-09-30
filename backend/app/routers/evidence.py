from typing import Optional
from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.evidence import (
    EvidenceCreateRequest,
    EvidenceItemSchema,
    EvidenceListResponse,
    EvidenceUpdateRequest,
    GitHubAnalysisCreateRequest,
    GitHubAnalysisSchema,
)
from app.services import evidence_service

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get(
    "",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Evidence Records",
)
def get_evidence_list(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves all portfolio evidence records belonging to the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_evidence_list(user_id=user_id)


@router.post(
    "",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create Candidate Evidence Record",
)
def create_evidence(
    req: EvidenceCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Creates a new portfolio evidence record for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.create_candidate_evidence(user_id=user_id, req=req)


@router.get(
    "/github",
    response_model=Optional[GitHubAnalysisSchema],
    status_code=status.HTTP_200_OK,
    summary="Get Latest Candidate GitHub Analysis Telemetry",
)
def get_github_analysis(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the latest stored GitHub analysis telemetry for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_github_analysis(user_id=user_id)


@router.post(
    "/github",
    response_model=GitHubAnalysisSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Save Candidate GitHub Analysis Telemetry",
)
def save_github_analysis(
    req: GitHubAnalysisCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Stores GitHub analysis telemetry associated with the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.create_candidate_github_analysis(user_id=user_id, req=req)


@router.get(
    "/{evidence_id}",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Get Single Candidate Evidence Item",
)
def get_evidence_item(
    evidence_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves a single portfolio evidence item only if owned by the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_evidence_item(user_id=user_id, evidence_id=evidence_id)


@router.patch(
    "/{evidence_id}",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Update Candidate Evidence Item",
)
def update_evidence_item(
    evidence_id: str,
    req: EvidenceUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Updates fields of an existing portfolio evidence record if owned by the candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.update_candidate_evidence_item(
        user_id=user_id,
        evidence_id=evidence_id,
        req=req,
    )
