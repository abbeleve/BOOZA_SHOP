from pydantic import BaseModel, Field
from typing import Optional


class FoodCategoryCreate(BaseModel):
    """Схема для создания категории блюд"""
    category_id: int = Field(..., gt=0, description="ID категории (уникальный)")
    name: str = Field(..., min_length=1, max_length=100, description="Название категории")


class FoodCategoryUpdate(BaseModel):
    """Схема для обновления категории блюд"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Новое название категории")


class FoodCategoryResponse(BaseModel):
    """Схема ответа с данными категории"""
    category_id: int
    name: str

    class Config:
        from_attributes = True
