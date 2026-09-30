from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

CurrentYearType = Literal[
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Final Year",
    "Graduated",
]

ExperienceLevelType = Literal[
    "Beginner",
    "Student",
    "Fresher",
    "Early Career",
    "Experienced",
]


class ProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    college: str = Field(..., min_length=1, max_length=255)
    degree: str = Field(..., min_length=1, max_length=255)
    year: CurrentYearType
    experience_level: ExperienceLevelType
    target_role: str = Field(..., min_length=1, max_length=255)
    custom_role: Optional[str] = Field(default=None, max_length=255)
    availability_hours_per_week: int = Field(default=10, ge=1, le=80)
    has_completed_setup: bool = False


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    full_name: str
    email: str
    college: str
    degree: str
    year: str
    experience_level: str
    target_role: str
    custom_role: Optional[str] = None
    availability_hours_per_week: int
    has_completed_setup: bool
    created_at: datetime
    updated_at: datetime


class ProfileTestResponse(BaseModel):
    status: str
    message: str
