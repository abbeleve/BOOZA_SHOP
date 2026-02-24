# backend/schemas/staff.py
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    STAFF = "STAFF"
    ADMIN = "ADMIN"

class StaffCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=29, description="Username существующего пользователя")
    role: RoleEnum = Field(default=RoleEnum.STAFF, description="Роль сотрудника")

class StaffResponse(BaseModel):
    username: str
    role: str
    user_id: int
    name: str
    surname: str
    email: str
    phone: str

    class Config:
        orm_mode = True