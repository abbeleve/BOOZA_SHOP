from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class DailyStats(BaseModel):
    """Статистика за один день"""
    date: str
    orders_count: int
    revenue: int


class TopMenuItem(BaseModel):
    """Популярное блюдо"""
    menu_item_id: int
    food_name: str
    description: Optional[str]
    price: int
    image_url: Optional[str]
    total_quantity: int
    orders_count: int


class CategoryRevenue(BaseModel):
    """Выручка по категории"""
    category_id: int
    category_name: str
    revenue: int


class PeriodStats(BaseModel):
    """Статистика за период (день/месяц)"""
    orders_count: int = Field(..., description="Общее количество заказов")
    completed_orders: int = Field(..., description="Количество завершённых заказов")
    cancelled_orders: int = Field(..., description="Количество отменённых заказов")
    total_revenue: int = Field(..., description="Общая выручка (в рублях)")
    average_order_value: float = Field(..., description="Средний чек (в рублях)")


class DashboardAnalyticsResponse(BaseModel):
    """Ответ аналитики для дашборда администратора"""
    today: PeriodStats = Field(..., description="Статистика за сегодня")
    month: PeriodStats = Field(..., description="Статистика за месяц")
    daily_dynamics: List[DailyStats] = Field(..., description="Динамика по дням (последние 7 дней)")
    top_menu_items: List[TopMenuItem] = Field(..., description="Топ популярных блюд")


class DetailedAnalyticsResponse(BaseModel):
    """Расширенная аналитика (включая данные по категориям)"""
    today: PeriodStats
    month: PeriodStats
    daily_dynamics: List[DailyStats]
    top_menu_items: List[TopMenuItem]
    revenue_by_category: List[CategoryRevenue]


class MostPopularItemResponse(BaseModel):
    """Самое популярное блюдо"""
    menu_item_id: int
    food_name: str
    description: Optional[str]
    price: int
    image_url: Optional[str]
    total_quantity: int = Field(..., description="Общее количество проданных штук")
    orders_count: int = Field(..., description="Количество заказов с этим блюдом")
