from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatusEnum(str, Enum):
    """Статусы заказа"""
    PENDING = "PENDING"  # В обработке
    COMPLETED = "COMPLETED"  # Выполнен
    CANCELLED = "CANCELLED"  # Отменён


class OrderItemCreate(BaseModel):
    """Элемент для создания заказа"""
    menu_item_id: int = Field(..., gt=0, description="ID блюда из меню")
    quantity: int = Field(..., gt=0, ge=1, le=100, description="Количество (1-100)")


class OrderCreate(BaseModel):
    """Схема для создания нового заказа"""
    delivery_address: str = Field(..., min_length=5, max_length=500, description="Адрес доставки")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Список блюд для заказа")
    description: Optional[str] = Field(None, max_length=1000, description="Комментарий к заказу")
    phone: str = Field(..., min_length=10, max_length=20, description="Номер телефона для связи")

    @field_validator('delivery_address')
    @classmethod
    def validate_address(cls, v):
        if not v or not v.strip():
            raise ValueError('Адрес доставки не может быть пустым')
        return v.strip()

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v or not v.strip():
            raise ValueError('Номер телефона не может быть пустым')
        # Удаляем все нецифровые символы кроме +
        cleaned = ''.join(c for c in v if c.isdigit() or c == '+')
        if len(cleaned) < 10:
            raise ValueError('Номер телефона должен содержать минимум 10 символов')
        return cleaned


class OrderItemResponse(BaseModel):
    """Элемент заказа в ответе"""
    order_food_id: int
    menu_item_id: int
    food_name: str
    quantity: int
    price_per_item: int
    total: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Полный ответ с данными заказа"""
    order_id: int
    status: str
    create_datetime: datetime
    end_datetime: Optional[datetime] = None
    delivery_address: str
    phone: Optional[str] = None
    total_amount: int
    description: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderShortResponse(BaseModel):
    """Краткая информация о заказе (для списков)"""
    order_id: int
    status: str
    create_datetime: datetime
    total_amount: int
    delivery_address: str
    items_count: int

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    """Схема для обновления статуса заказа"""
    status: OrderStatusEnum = Field(..., description="Новый статус заказа")
