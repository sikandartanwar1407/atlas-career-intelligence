from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ResourceStatusItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    candidate_id: UUID
    resource_id: str
    is_started: bool = False
    is_completed: bool = False
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResourceStatusUpdateRequest(BaseModel):
    is_started: Optional[bool] = None
    is_completed: Optional[bool] = None


class ResourceStatusListResponse(BaseModel):
    candidate_id: UUID
    total_tracked: int
    started_count: int
    completed_count: int
    resources: List[ResourceStatusItem] = Field(default_factory=list)
