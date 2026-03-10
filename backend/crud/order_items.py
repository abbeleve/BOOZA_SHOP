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
    ВАЖНО: caller должен вызвать db.commit() после создания.
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
    db.flush()  # Получаем order_food_id, но не коммитим
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
    ВАЖНО: caller должен вызвать db.commit() после обновления.
    """
    item = get_order_item(db, order_food_id)
    if not item:
        return None

    if new_quantity <= 0:
        raise ValueError("Новое количество должно быть положительным")

    # Обновляем количество
    item.quantity = new_quantity

    # Пересчитываем общую сумму заказа
    _recalculate_order_total(db, item.order_id)

    db.flush()  # Не коммитим
    return item

def delete_order_item(db: Session, order_food_id: int) -> bool:
    """
    Удаляет элемент заказа и пересчитывает сумму заказа.
    ВАЖНО: caller должен вызвать db.commit() после удаления.
    """
    item = get_order_item(db, order_food_id)
    if not item:
        return False

    order_id = item.order_id
    db.delete(item)

    # Пересчитываем общую сумму заказа
    _recalculate_order_total(db, order_id)

    db.flush()  # Не коммитим
    return True

def _recalculate_order_total(db: Session, order_id: int) -> None:
    """
    Вспомогательная функция: пересчитывает total_amount заказа.
    ВАЖНО: caller должен вызвать db.commit() после пересчёта.
    """
    from crud.orders import get_order_by_id
    order = get_order_by_id(db, order_id)
    if not order:
        return

    # Суммируем все элементы заказа
    new_total = sum(item.quantity * item.price for item in order.items)
    order.total_amount = new_total
    db.flush()  # Не коммитим