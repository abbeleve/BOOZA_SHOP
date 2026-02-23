from sqlalchemy.orm import Session
from models.setting_up_db import OrderItems
from typing import Optional, List

def create_order_item(
    db: Session,
    order_id: int,
    menu_item_id: int,
    quantity: int,
    price: int  # Зафиксированная цена на момент заказа!
) -> OrderItems:
    """
    Создаёт элемент заказа.
    ВАЖНО: price должен быть передан из меню на момент создания заказа!
    """
    if quantity <= 0:
        raise ValueError("Количество должно быть положительным")
    if price <= 0:
        raise ValueError("Цена должна быть положительной")
    
    item = OrderItems(
        order_id=order_id,
        menu_item_id=menu_item_id,
        quantity=quantity,
        price=price
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_order_item(db: Session, order_food_id: int) -> Optional[OrderItems]:
    """Получает элемент заказа по ID"""
    return db.query(OrderItems).filter(OrderItems.order_food_id == order_food_id).first()

def get_order_items_by_order(db: Session, order_id: int) -> List[OrderItems]:
    """Получает все элементы заказа по order_id"""
    return db.query(OrderItems).filter(OrderItems.order_id == order_id).all()

def update_order_item_quantity(
    db: Session,
    order_food_id: int,
    new_quantity: int
) -> Optional[OrderItems]:
    """
    Обновляет количество в элементе заказа.
    Пересчитывает total_amount заказа автоматически.
    """
    item = get_order_item(db, order_food_id)
    if not item:
        return None
    
    if new_quantity <= 0:
        raise ValueError("Новое количество должно быть положительным")
    
    # Обновляем количество
    old_quantity = item.quantity
    item.quantity = new_quantity
    db.commit()
    
    # Пересчитываем общую сумму заказа
    _recalculate_order_total(db, item.order_id)
    
    db.refresh(item)
    return item

def delete_order_item(db: Session, order_food_id: int) -> bool:
    """Удаляет элемент заказа и пересчитывает сумму заказа"""
    item = get_order_item(db, order_food_id)
    if not item:
        return False
    
    order_id = item.order_id
    db.delete(item)
    db.commit()
    
    # Пересчитываем общую сумму заказа
    _recalculate_order_total(db, order_id)
    return True

def _recalculate_order_total(db: Session, order_id: int) -> None:
    """Вспомогательная функция: пересчитывает total_amount заказа"""
    from crud.orders import get_order_by_id
    order = get_order_by_id(db, order_id)
    if not order:
        return
    
    # Суммируем все элементы заказа
    new_total = sum(item.quantity * item.price for item in order.items)
    order.total_amount = new_total
    db.commit()