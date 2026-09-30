from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

EvidenceTypeEnum = Literal[
    "Project",
    "Dashboard",
    "Certificate",
    "GitHub Repository",
    "Presentation",
    "Case Study",
]

VerificationStatusEnum = Literal["Verified", "Under Review", "Submitted"]


class EvidenceItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    candidate_id: UUID
    title: str
    skill_name: str
    evidence_type: EvidenceTypeEnum
    description: str
    link: str
    date: str
    verification_status: VerificationStatusEnum = "Submitted"
    metrics: Optional[str] = None
    sha_hash: Optional[str] = None
    evaluator_feedback: Optional[str] = None
    is_public: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class EvidenceCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    skill_name: str = Field(..., min_length=1, max_length=100)
    evidence_type: EvidenceTypeEnum
    description: str = Field(..., min_length=1)
    link: str = Field(..., min_length=1)
    date: Optional[str] = None
    verification_status: Optional[VerificationStatusEnum] = "Submitted"
    metrics: Optional[str] = None
    sha_hash: Optional[str] = None
    evaluator_feedback: Optional[str] = None
    is_public: Optional[bool] = True


class EvidenceUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    skill_name: Optional[str] = Field(None, min_length=1, max_length=100)
    evidence_type: Optional[EvidenceTypeEnum] = None
    description: Optional[str] = Field(None, min_length=1)
    link: Optional[str] = Field(None, min_length=1)
    date: Optional[str] = None
    verification_status: Optional[VerificationStatusEnum] = None
    metrics: Optional[str] = None
    sha_hash: Optional[str] = None
    evaluator_feedback: Optional[str] = None
    is_public: Optional[bool] = None


class EvidenceListResponse(BaseModel):
    candidate_id: UUID
    total_count: int
    verified_count: int
    under_review_count: int
    items: List[EvidenceItemSchema] = Field(default_factory=list)


class GitHubAnalysisSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    candidate_id: UUID
    github_username: str
    github_user_data: Dict[str, Any] = Field(default_factory=dict)
    analyzed_repos_count: int = 0
    primary_languages: List[Any] = Field(default_factory=list)
    detected_topics: List[str] = Field(default_factory=list)
    demonstrated_skills_detected: List[str] = Field(default_factory=list)
    evidence_readiness_boost: int = 0
    extracted_evidence_count: int = 0
    raw_analysis_payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class GitHubAnalysisCreateRequest(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=100)
    github_user_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    analyzed_repos_count: Optional[int] = 0
    primary_languages: Optional[List[Any]] = Field(default_factory=list)
    detected_topics: Optional[List[str]] = Field(default_factory=list)
    demonstrated_skills_detected: Optional[List[str]] = Field(default_factory=list)
    evidence_readiness_boost: Optional[int] = 0
    extracted_evidence_count: Optional[int] = 0
    raw_analysis_payload: Optional[Dict[str, Any]] = Field(default_factory=dict)
