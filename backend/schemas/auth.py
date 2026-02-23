from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=29, description="Уникальное имя пользователя")
    password: str = Field(..., min_length=6, max_length=1024, description="Пароль")
    name: str = Field(..., min_length=2, max_length=29, description="Имя")
    surname: str = Field(..., min_length=2, max_length=29, description="Фамилия")
    email: EmailStr = Field(..., description="Email")
    phone: str = Field(..., min_length=10, max_length=20, description="Телефон")
    patronymic: Optional[str] = Field(None, max_length=29, description="Отчество")
    address: Optional[str] = Field(None, max_length=255, description="Адрес")

    @validator('phone')
    def validate_phone_format(cls, v):
        if not any(c.isdigit() for c in v):
            raise ValueError('Телефон должен содержать цифры')
        return v.strip()

class UserLogin(BaseModel):
    username: str = Field(..., description="Имя пользователя или email")
    password: str = Field(..., description="Пароль")

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str