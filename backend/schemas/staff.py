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

class StaffUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=29, description="Имя")
    surname: Optional[str] = Field(None, min_length=2, max_length=29, description="Фамилия")
    patronymic: Optional[str] = Field(None, max_length=29, description="Отчество")
    email: Optional[str] = Field(None, description="Email")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Телефон")
    address: Optional[str] = Field(None, description="Адрес доставки")
    role: Optional[RoleEnum] = Field(None, description="Роль сотрудника")

class StaffResponse(BaseModel):
    username: str
    role: str
    user_id: int
    name: str
    surname: str
    email: str
    phone: str
    patronymic: Optional[str] = None
    address: Optional[str] = None
    
    class Config:
        orm_mode = True

class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=6, description="Текущий пароль")
    new_password: str = Field(..., min_length=6, description="Новый пароль")