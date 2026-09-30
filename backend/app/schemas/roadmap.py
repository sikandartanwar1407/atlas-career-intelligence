from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class RoadmapActionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    roadmap_step_id: Optional[UUID] = None
    action_id: str
    title: str
    description: Optional[str] = None
    action_type: str
    estimated_minutes: int = 45
    is_completed: bool = False
    completed_at: Optional[datetime] = None


class RoadmapStepItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    candidate_id: Optional[UUID] = None
    step_id: str
    step_number: int
    skill_name: str
    priority: str
    gap: int
    allocated_hours: float
    estimated_duration_weeks: str
    title: str
    description: str
    is_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    actions: List[RoadmapActionItem] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: UUID
    target_role: str
    total_steps: int
    completed_steps: int
    total_allocated_hours: float
    steps: List[RoadmapStepItem] = Field(default_factory=list)
