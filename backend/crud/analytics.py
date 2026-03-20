from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.setting_up_db import Order, Status
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from collections import defaultdict


def get_today_start_end() -> tuple[datetime, datetime]:
    """Возвращает начало и конец текущего дня"""
    now = datetime.utcnow()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    return start_of_day, end_of_day


def get_month_start_end() -> tuple[datetime, datetime]:
    """Возвращает начало и конец текущего месяца"""
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    # Последний день месяца
    if now.month == 12:
        end_of_month = now.replace(year=now.year + 1, month=1, day=1) - timedelta(seconds=1)
    else:
        end_of_month = now.replace(month=now.month + 1, day=1) - timedelta(seconds=1)
    return start_of_month, end_of_month


def get_orders_count_by_period(
    db: Session,
    start_date: datetime,
    end_date: datetime,
    status: Optional[Status] = None
) -> int:
    """
    Получает количество заказов за период.
    По умолчанию считает все заказы, кроме отменённых.
    """
    query = db.query(func.count(Order.order_id)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date
        )
    )
    
    # Исключаем отменённые заказы из статистики
    if status is None:
        query = query.filter(Order.status != Status.CANCELLED)
    else:
        query = query.filter(Order.status == status)
    
    return query.scalar() or 0


def get_total_revenue_by_period(
    db: Session,
    start_date: datetime,
    end_date: datetime,
    status: Optional[Status] = None
) -> int:
    """
    Получает общую сумму заказов (выручку) за период.
    По умолчанию считает только завершённые и активные заказы.
    """
    query = db.query(func.sum(Order.total_amount)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date
        )
    )
    
    # Исключаем отменённые заказы из статистики
    if status is None:
        query = query.filter(Order.status != Status.CANCELLED)
    else:
        query = query.filter(Order.status == status)
    
    return query.scalar() or 0


def get_average_order_value(
    db: Session,
    start_date: datetime,
    end_date: datetime,
    status: Optional[Status] = None
) -> float:
    """
    Получает средний чек за период.
    """
    query = db.query(func.avg(Order.total_amount)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date
        )
    )
    
    # Исключаем отменённые заказы из статистики
    if status is None:
        query = query.filter(Order.status != Status.CANCELLED)
    else:
        query = query.filter(Order.status == status)
    
    return query.scalar() or 0.0


def get_orders_statistics_by_period(
    db: Session,
    start_date: datetime,
    end_date: datetime
) -> Dict:
    """
    Получает полную статистику заказов за период.
    """
    # Количество заказов по статусам
    orders_by_status = db.query(
        Order.status,
        func.count(Order.order_id)
    ).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date
        )
    ).group_by(Order.status).all()
    
    status_counts = {status.name: count for status, count in orders_by_status}
    
    # Общая выручка (только не отменённые)
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date,
            Order.status != Status.CANCELLED
        )
    ).scalar() or 0
    
    # Средний чек (только не отменённые)
    avg_check = db.query(func.avg(Order.total_amount)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date,
            Order.status != Status.CANCELLED
        )
    ).scalar() or 0.0
    
    # Общее количество заказов (все)
    total_orders = db.query(func.count(Order.order_id)).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date
        )
    ).scalar() or 0
    
    return {
        "total_orders": total_orders,
        "orders_by_status": status_counts,
        "total_revenue": total_revenue,
        "average_order_value": round(avg_check, 2)
    }


def get_today_statistics(db: Session) -> Dict:
    """
    Получает статистику за сегодня.
    """
    start_of_day, end_of_day = get_today_start_end()
    return get_orders_statistics_by_period(db, start_of_day, end_of_day)


def get_month_statistics(db: Session) -> Dict:
    """
    Получает статистику за текущий месяц.
    """
    start_of_month, end_of_month = get_month_start_end()
    return get_orders_statistics_by_period(db, start_of_month, end_of_month)


def get_dashboard_analytics(db: Session) -> Dict:
    """
    Получает полную аналитику для дашборда администратора.
    Включает:
    - Статистику за сегодня
    - Статистику за месяц
    - Динамику по дням (последние 7 дней)
    - Топ популярных блюд
    """
    # Статистика за сегодня
    today_stats = get_today_statistics(db)
    
    # Статистика за месяц
    month_stats = get_month_statistics(db)
    
    # Динамика по дням (последние 7 дней)
    daily_stats = get_daily_dynamics(db, days=7)
    
    # Топ популярных блюд
    top_items = get_top_menu_items(db, limit=5)
    
    return {
        "today": {
            "orders_count": today_stats["total_orders"],
            "completed_orders": today_stats["orders_by_status"].get("COMPLETED", 0),
            "cancelled_orders": today_stats["orders_by_status"].get("CANCELLED", 0),
            "total_revenue": today_stats["total_revenue"],
            "average_order_value": today_stats["average_order_value"]
        },
        "month": {
            "orders_count": month_stats["total_orders"],
            "completed_orders": month_stats["orders_by_status"].get("COMPLETED", 0),
            "cancelled_orders": month_stats["orders_by_status"].get("CANCELLED", 0),
            "total_revenue": month_stats["total_revenue"],
            "average_order_value": month_stats["average_order_value"]
        },
        "daily_dynamics": daily_stats,
        "top_menu_items": top_items
    }


def get_daily_dynamics(db: Session, days: int = 7) -> List[Dict]:
    """
    Получает динамику заказов по дням за последние N дней.
    """
    now = datetime.utcnow()
    start_date = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Группировка по датам
    results = db.query(
        func.date(Order.create_datetime).label('order_date'),
        func.count(Order.order_id).label('orders_count'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        and_(
            Order.create_datetime >= start_date,
            Order.create_datetime <= end_date,
            Order.status != Status.CANCELLED
        )
    ).group_by(
        func.date(Order.create_datetime)
    ).order_by(
        func.date(Order.create_datetime)
    ).all()
    
    # Преобразуем в список словарей
    daily_data = [
        {
            "date": str(date),
            "orders_count": count or 0,
            "revenue": revenue or 0
        }
        for date, count, revenue in results
    ]
    
    return daily_data


def get_top_menu_items(db: Session, limit: int = 10) -> List[Dict]:
    """
    Получает топ популярных блюд по количеству заказов.
    Возвращает полную информацию о блюдах из меню.
    """
    from models.setting_up_db import OrderItems, MenuItems
    
    results = db.query(
        MenuItems.menu_id,
        MenuItems.food_name,
        MenuItems.description,
        MenuItems.price,
        MenuItems.image_url,
        func.sum(OrderItems.quantity).label('total_quantity'),
        func.count(OrderItems.order_food_id).label('orders_count')
    ).join(
        OrderItems, OrderItems.menu_item_id == MenuItems.menu_id
    ).join(
        Order, Order.order_id == OrderItems.order_id
    ).filter(
        Order.status != Status.CANCELLED
    ).group_by(
        MenuItems.menu_id,
        MenuItems.food_name,
        MenuItems.description,
        MenuItems.price,
        MenuItems.image_url
    ).order_by(
        func.sum(OrderItems.quantity).desc()
    ).limit(limit).all()
    
    return [
        {
            "menu_item_id": menu_id,
            "food_name": name,
            "description": description,
            "price": price,
            "image_url": image_url,
            "total_quantity": total_qty or 0,
            "orders_count": orders_count or 0
        }
        for menu_id, name, description, price, image_url, total_qty, orders_count in results
    ]


def get_most_popular_item(db: Session) -> Optional[Dict]:
    """
    Получает самое популярное блюдо (топ-1).
    Возвращает None, если заказов ещё не было.
    """
    top_items = get_top_menu_items(db, limit=1)
    return top_items[0] if top_items else None


def get_revenue_by_category(db: Session) -> List[Dict]:
    """
    Получает выручку по категориям блюд.
    """
    from models.setting_up_db import OrderItems, MenuItems, FoodType
    
    results = db.query(
        FoodType.category_id,
        FoodType.name.label('category_name'),
        func.sum(OrderItems.price * OrderItems.quantity).label('revenue')
    ).join(
        MenuItems, MenuItems.category_id == FoodType.category_id
    ).join(
        OrderItems, OrderItems.menu_item_id == MenuItems.menu_id
    ).join(
        Order, Order.order_id == OrderItems.order_id
    ).filter(
        Order.status != Status.CANCELLED
    ).group_by(
        FoodType.category_id,
        FoodType.name
    ).order_by(
        func.sum(OrderItems.price * OrderItems.quantity).desc()
    ).all()
    
    return [
        {
            "category_id": cat_id,
            "category_name": name,
            "revenue": revenue or 0
        }
        for cat_id, name, revenue in results
    ]
