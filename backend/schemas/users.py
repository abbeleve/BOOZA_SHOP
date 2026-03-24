from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserResponse(BaseModel):
    user_id: int
    username: str
    name: str
    surname: str
    patronymic: Optional[str] = None
    email: str
    phone: str
    address: Optional[str] = None
    is_staff: bool
    role: Optional[str] = None
    
    class Config:
        orm_mode = True