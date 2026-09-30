from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SkillDeltaDetail(BaseModel):
    previous: int
    current: int
    change: int


class ReassessmentSubmitRequest(BaseModel):
    skill_ratings: Dict[str, int] = Field(
        ...,
        description="Map of skill_name to demonstrated/self rating (0-100)",
        min_length=1,
    )
    role_id: Optional[str] = None


class ReassessmentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    candidate_id: UUID
    previous_overall_score: int
    current_overall_score: int
    improvement: int
    skill_deltas: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class ReassessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    candidate_id: UUID
    previous_overall_score: int
    current_overall_score: int
    improvement: int
    skill_deltas: Dict[str, Any]
    created_at: datetime
    skills_reassessed_count: int
    roadmap_regenerated: bool = True


class ReassessmentHistoryResponse(BaseModel):
    candidate_id: UUID
    total_reassessments: int
    cumulative_improvement: int
    history: List[ReassessmentItem] = Field(default_factory=list)
