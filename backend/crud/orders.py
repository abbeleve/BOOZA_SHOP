from sqlalchemy.orm import Session
from models.setting_up_db import Order, OrderItems, Status
from typing import Optional, List, Dict
from datetime import datetime

def create_order(
    db: Session,
    user_id: int,
    delivery_address: str,
    items: List[Dict[str, int]],  # [{"menu_item_id": 1, "quantity": 2}, ...]
    description: Optional[str] = None
) -> Order:
    """
    Создаёт заказ со всеми элементами в одной транзакции.
    items: список словарей с menu_item_id и quantity
    Автоматически рассчитывает total_amount на основе цен из меню на момент создания.
    """
    # Проверяем наличие пользователя
    from crud.users import get_user_by_id
    if not get_user_by_id(db, user_id):
        raise ValueError(f"Пользователь с ID {user_id} не существует")
    
    # Проверяем и рассчитываем элементы
    total_amount = 0
    validated_items = []
    
    from crud.menu_items import get_menu_item
    for item in items:
        menu_item = get_menu_item(db, item["menu_item_id"])
        if not menu_item:
            raise ValueError(f"Элемент меню с ID {item['menu_item_id']} не существует")
        if not menu_item.is_available:
            raise ValueError(f"Элемент '{menu_item.food_name}' недоступен для заказа")
        if item["quantity"] <= 0:
            raise ValueError(f"Количество для '{menu_item.food_name}' должно быть > 0")
        
        # Фиксируем цену на момент заказа (важно!)
        item_total = menu_item.price * item["quantity"]
        total_amount += item_total
        validated_items.append({
            "menu_item_id": menu_item.menu_id,
            "quantity": item["quantity"],
            "price": menu_item.price,  # Текущая цена из меню
            "item_total": item_total
        })
    
    if total_amount <= 0:
        raise ValueError("Общая сумма заказа должна быть положительной")
    
    if not delivery_address or len(delivery_address.strip()) < 5:
        raise ValueError("Адрес доставки должен содержать минимум 5 символов")
    
    # Создаём заказ
    order = Order(
        user_id=user_id,
        create_datetime=datetime.utcnow(),
        status=Status.PENDING,
        delivery_address=delivery_address.strip(),
        total_amount=total_amount,
        description=description
    )
    db.add(order)
    db.flush()  # Получаем order_id для элементов
    
    # Создаём элементы заказа
    from crud.order_items import create_order_item
    for item in validated_items:
        create_order_item(
            db,
            order_id=order.order_id,
            menu_item_id=item["menu_item_id"],
            quantity=item["quantity"],
            price=item["price"]  # Зафиксированная цена
        )
    
    db.commit()
    db.refresh(order)
    return order

def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
    """Получает заказ по ID со всеми элементами"""
    return db.query(Order).filter(Order.order_id == order_id).first()

def get_orders_by_user(db: Session, user_id: int, status: Optional[Status] = None) -> List[Order]:
    """Получает все заказы пользователя (с фильтрацией по статусу)"""
    query = db.query(Order).filter(Order.user_id == user_id)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.create_datetime.desc()).all()

def get_all_orders(db: Session, status: Optional[Status] = None) -> List[Order]:
    """Получает все заказы (для админки)"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.create_datetime.desc()).all()

def update_order_status(
    db: Session,
    order_id: int,
    new_status: Status,
    end_datetime: Optional[datetime] = None
) -> Optional[Order]:
    """Обновляет статус заказа и время завершения при необходимости"""
    order = get_order_by_id(db, order_id)
    if not order:
        return None
    
    # Логика переходов статусов (опционально)
    if order.status == Status.CANCELLED and new_status != Status.CANCELLED:
        raise ValueError("Отменённый заказ нельзя изменить на другой статус")
    
    order.status = new_status
    
    # Автоматически устанавливаем время завершения для завершённых/отменённых заказов
    if new_status in (Status.COMPLETED, Status.CANCELLED):
        order.end_datetime = end_datetime or datetime.utcnow()
    elif new_status == Status.PENDING:
        order.end_datetime = None  # Сбрасываем если вернули в ожидание
    
    db.commit()
    db.refresh(order)
    return order

def cancel_order(db: Session, order_id: int) -> Optional[Order]:
    """Удобный метод для отмены заказа"""
    return update_order_status(db, order_id, Status.CANCELLED)

def complete_order(db: Session, order_id: int) -> Optional[Order]:
    """Удобный метод для завершения заказа"""
    return update_order_status(db, order_id, Status.COMPLETED)

def delete_order(db: Session, order_id: int) -> bool:
    """
    Удаляет заказ и ВСЕ его элементы (каскадное удаление).
    Рекомендуется использовать только для тестов или отменённых заказов.
    """
    order = get_order_by_id(db, order_id)
    if not order:
        return False
    
    # Защита от удаления активных заказов
    if order.status not in (Status.CANCELLED, Status.PENDING):
        raise ValueError(
            f"Нельзя удалить заказ со статусом {order.status.name}. "
            "Сначала отмените заказ."
        )
    
    db.delete(order)
    db.commit()
    return True

def get_order_details(db: Session, order_id: int) -> Optional[Dict]:
    """
    Возвращает полную информацию о заказе в виде словаря:
    - данные заказа
    - информация о пользователе
    - список элементов с деталями из меню
    """
    order = get_order_by_id(db, order_id)
    if not order:
        return None
    
    items = []
    for item in order.items:
        items.append({
            "order_food_id": item.order_food_id,
            "food_name": item.menu_item.food_name if item.menu_item else "Удалённый элемент",
            "quantity": item.quantity,
            "price_per_item": item.price,
            "total": item.quantity * item.price,
            "image_url": item.menu_item.image_url if item.menu_item else None
        })
    
    return {
        "order_id": order.order_id,
        "status": order.status.name,
        "create_datetime": order.create_datetime.isoformat(),
        "end_datetime": order.end_datetime.isoformat() if order.end_datetime else None,
        "delivery_address": order.delivery_address,
        "total_amount": order.total_amount,
        "description": order.description,
        "user": {
            "user_id": order.user.user_id,
            "username": order.user.username,
            "name": f"{order.user.name} {order.user.surname}",
            "phone": order.user.phone
        },
        "items": items
    }