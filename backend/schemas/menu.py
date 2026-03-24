from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import time

class MenuItemCreate(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=100, description="Название блюда")
    price: int = Field(..., gt=0, description="Цена в рублях (должна быть > 0)")
    category_id: int = Field(..., gt=0, description="ID категории")
    description: Optional[str] = Field(None, max_length=500, description="Описание блюда")
    image_url: Optional[str] = Field(None, max_length=255, description="URL изображения")
    is_available: bool = Field(True, description="Доступно ли блюдо для заказа")
    preparation_time_minutes: int = Field(15, ge=1, le=180, description="Время приготовления в минутах")

    class Config:
        schema_extra = {
            "example": {
                "food_name": "Маргарита",
                "price": 499,
                "category_id": 1,
                "description": "Классическая пицца с томатами и моцареллой",
                "is_available": True,
                "preparation_time_minutes": 20
            }
        }

    @validator('preparation_time_minutes')
    def convert_minutes_to_time(cls, v):
        # Валидация происходит здесь, конвертация будет в эндпоинте
        return v

class MenuItemUpdate(BaseModel):
    food_name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[int] = Field(None, gt=0)
    category_id: Optional[int] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=255)
    is_available: Optional[bool] = None
    preparation_time_minutes: Optional[int] = Field(None, ge=1, le=180)

    class Config:
        schema_extra = {
            "example": {
                "price": 549,
                "is_available": False
            }
        }

class MenuItemResponse(BaseModel):
    menu_id: int
    food_name: str
    price: int
    category_id: int
    description: Optional[str]
    image_url: Optional[str]
    is_available: bool
    preparation_time: str  # HH:MM:SS
    category_name: Optional[str] = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "menu_id": 1,
                "food_name": "Маргарита",
                "price": 499,
                "category_id": 1,
                "description": "Классическая пицца с томатами и моцареллой",
                "is_available": True,
                "preparation_time": "00:20:00",
                "category_name": "Пицца"
            }
        }