from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AssessmentAnswerInput(BaseModel):
    question_id: str = Field(..., min_length=1, max_length=255)
    skill_name: str = Field(..., min_length=1, max_length=255)
    selected_option: int = Field(..., ge=-1, le=10) # -1 indicates skipped
    is_correct: Optional[bool] = None
    question_type: Optional[str] = "theory" # "theory" | "coding"
    submitted_text: Optional[str] = None


class AssessmentSubmitRequest(BaseModel):
    role_id: str = Field(..., min_length=1, max_length=255)
    answers: List[AssessmentAnswerInput] = Field(..., min_length=1)
    self_ratings: Optional[Dict[str, int]] = Field(default_factory=dict)


class SkillDiagnosticResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    skill_name: str
    display_name: str
    baseline_score: int
    demonstrated_score: int
    role_threshold: int
    gap: int
    priority_level: str
    evidence_status: str
    description: Optional[str] = None
    strategic_note: Optional[str] = None
    theory_performance: Optional[str] = None
    coding_performance: Optional[str] = None
    competency_status: Optional[str] = None


class AssessmentAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: str
    skill_name: str
    selected_option: int
    is_correct: bool


class AssessmentSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    candidate_id: UUID
    role_id: str
    overall_demonstrated: int
    largest_gap_skill: str
    completed_at: datetime
    created_at: Optional[datetime] = None
    skill_diagnostics: List[SkillDiagnosticResponse] = Field(default_factory=list)
    answers_count: int = 0
    theory_score: Optional[int] = None
    coding_score: Optional[int] = None
    theory_correct_count: Optional[int] = None
    theory_total_count: Optional[int] = None
    coding_correct_count: Optional[int] = None
    coding_skipped_count: Optional[int] = None
    coding_total_count: Optional[int] = None
