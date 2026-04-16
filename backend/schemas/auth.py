import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator

class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=29, description="Уникальное имя пользователя")
    password: str = Field(..., min_length=6, max_length=128, description="Пароль")
    name: str = Field(..., min_length=2, max_length=29, description="Имя")
    surname: str = Field(..., min_length=2, max_length=29, description="Фамилия")
    email: EmailStr = Field(..., description="Email")
    phone: str = Field(..., min_length=10, max_length=20, description="Телефон")
    patronymic: Optional[str] = Field(None, max_length=29, description="Отчество")

    @validator('password')
    def validate_password_strength(cls, v):
        if any(ch.isspace() for ch in v):
            raise ValueError("Пароль не должен содержать пробелы")
        if not any(ch.islower() for ch in v):
            raise ValueError("Пароль должен содержать хотя бы одну строчную букву")
        if not any(ch.isupper() for ch in v):
            raise ValueError("Пароль должен содержать хотя бы одну заглавную букву")
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Пароль должен содержать хотя бы одну цифру")
        if not re.search(r"[^\w\s]", v, flags=re.UNICODE):
            raise ValueError("Пароль должен содержать хотя бы один спецсимвол")
        return v
    
    @validator('phone')
    def validate_phone_format(cls, v):
        if not any(c.isdigit() for c in v):
            raise ValueError('Телефон должен содержать цифры')
        return v.strip()

class UserLogin(BaseModel):
    username: str = Field(..., min_length=2, max_length=29, description="Имя пользователя или email")
    password: str = Field(..., min_length=6, max_length=128, description="Пароль")

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=29, description="Имя")
    surname: Optional[str] = Field(None, min_length=2, max_length=29, description="Фамилия")
    patronymic: Optional[str] = Field(None, max_length=29, description="Отчество")
    email: Optional[EmailStr] = Field(None, description="Email")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Телефон")
    address: Optional[str] = Field(None, description="Адрес доставки")

    @validator('phone')
    def validate_phone_format(cls, v):
        if v is not None and not any(c.isdigit() for c in v):
            raise ValueError('Телефон должен содержать цифры')
        return v.strip() if v else v
