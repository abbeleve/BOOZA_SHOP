from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from models.database import get_db
from models.setting_up_db import Users
from core.security import get_current_admin, get_current_user
from crud import analytics
from schemas.analytics import (
    DashboardAnalyticsResponse,
    DetailedAnalyticsResponse,
    PeriodStats,
    MostPopularItemResponse
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает основную аналитику для дашборда администратора.
    
    Включает:
    - **today**: Статистика за сегодня (количество заказов, выручка, средний чек)
    - **month**: Статистика за текущий месяц
    - **daily_dynamics**: Динамика по дням (последние 7 дней)
    - **top_menu_items**: Топ-5 популярных блюд
    
    Требуются права администратора.
    """
    return analytics.get_dashboard_analytics(db)


@router.get("/detailed", response_model=DetailedAnalyticsResponse)
def get_detailed_analytics(
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает расширенную аналитику для администратора.
    
    Включает все данные из dashboard + выручку по категориям.
    
    Требуются права администратора.
    """
    dashboard_data = analytics.get_dashboard_analytics(db)
    revenue_by_category = analytics.get_revenue_by_category(db)
    
    return DetailedAnalyticsResponse(
        today=dashboard_data["today"],
        month=dashboard_data["month"],
        daily_dynamics=dashboard_data["daily_dynamics"],
        top_menu_items=dashboard_data["top_menu_items"],
        revenue_by_category=revenue_by_category
    )


@router.get("/period", response_model=PeriodStats)
def get_period_statistics(
    start_date: str = Query(..., description="Начальная дата (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Конечная дата (YYYY-MM-DD)"),
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает статистику за произвольный период.
    
    Параметры:
    - **start_date**: Начальная дата в формате YYYY-MM-DD
    - **end_date**: Конечная дата в формате YYYY-MM-DD
    
    Требуются права администратора.
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0)
        end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999)
    except ValueError:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=400,
            detail="Неверный формат даты. Используйте YYYY-MM-DD"
        )
    
    if start > end:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=400,
            detail="start_date должна быть раньше end_date"
        )
    
    stats = analytics.get_orders_statistics_by_period(db, start, end)
    
    return PeriodStats(
        orders_count=stats["total_orders"],
        completed_orders=stats["orders_by_status"].get("COMPLETED", 0),
        cancelled_orders=stats["orders_by_status"].get("CANCELLED", 0),
        total_revenue=stats["total_revenue"],
        average_order_value=stats["average_order_value"]
    )


@router.get("/summary")
def get_summary_analytics(
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает краткую сводку для отображения в заголовке дашборда.
    
    Возвращает:
    - Количество заказов за сегодня
    - Количество заказов за месяц
    - Выручку за сегодня
    - Выручку за месяц
    - Средний чек за сегодня
    
    Требуются права администратора.
    """
    today_stats = analytics.get_today_statistics(db)
    month_stats = analytics.get_month_statistics(db)
    
    return {
        "today_orders": today_stats["total_orders"],
        "today_revenue": today_stats["total_revenue"],
        "today_average_check": today_stats["average_order_value"],
        "month_orders": month_stats["total_orders"],
        "month_revenue": month_stats["total_revenue"],
        "month_average_check": month_stats["average_order_value"]
    }


@router.get("/most-popular", response_model=MostPopularItemResponse)
def get_most_popular_item(
    db: Session = Depends(get_db)
):
    """
    Получает самое популярное блюдо всех времён.
    
    Возвращает блюдо с наибольшим количеством проданных единиц.
    Если заказов ещё не было, возвращает 404.
    
    Доступно всем пользователям.
    """
    popular_item = analytics.get_most_popular_item(db)
    
    if not popular_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказов ещё не было. Самое популярное блюдо не определено."
        )
    
    return popular_item
