from sqlalchemy.orm import Session
from models.setting_up_db import MenuItems, FoodType
from datetime import time
from typing import Optional, List

def create_menu_item(
    db: Session,
    food_name: str,
    price: int,
    category_id: int,
    description: str = None,
    image_url: str = None,
    is_available: bool = True,
    preparation_time: time = None
) -> MenuItems:
    """
    Создаёт новый элемент меню.
    ВАЖНО: caller должен вызвать db.commit() после создания.
    """
    db_item = MenuItems(
        food_name=food_name,
        description=description,
        image_url=image_url,
        is_available=is_available,
        price=price,
        preparation_time=preparation_time or time(0, 15),  # 15 минут по умолчанию
        category_id=category_id
    )
    db.add(db_item)
    db.flush()  # Получаем menu_id, но не коммитим
    return db_item

def get_menu_items(
    db: Session,
    category_id: Optional[int] = None,
    available_only: bool = True,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
) -> List[MenuItems]:
    """Получает элементы меню с фильтрацией"""
    query = db.query(MenuItems)
    
    if category_id is not None:
        query = query.filter(MenuItems.category_id == category_id)
    
    if available_only:
        query = query.filter(MenuItems.is_available == True)
    
    if min_price is not None:
        query = query.filter(MenuItems.price >= min_price)
    
    if max_price is not None:
        query = query.filter(MenuItems.price <= max_price)
    
    return query.all()

def get_menu_item(db: Session, menu_id: int) -> Optional[MenuItems]:
    """Получает элемент меню по ID"""
    return db.query(MenuItems).filter(MenuItems.menu_id == menu_id).first()

def update_menu_item(
    db: Session,
    menu_id: int,
    food_name: Optional[str] = None,
    description: Optional[str] = None,
    image_url: Optional[str] = None,
    is_available: Optional[bool] = None,
    price: Optional[int] = None,
    preparation_time: Optional[time] = None,
    category_id: Optional[int] = None
) -> Optional[MenuItems]:
    """
    Обновляет элемент меню.
    ВАЖНО: caller должен вызвать db.commit() после обновления.
    """
    item = get_menu_item(db, menu_id)
    if not item:
        return None

    updates = {
        'food_name': food_name,
        'description': description,
        'image_url': image_url,
        'is_available': is_available,
        'price': price,
        'preparation_time': preparation_time,
        'category_id': category_id
    }

    for field, value in updates.items():
        if value is not None:
            if field == 'price' and value <= 0:
                raise ValueError("Цена должна быть положительной")
            setattr(item, field, value)

    db.flush()  # Не коммитим
    return item

def delete_menu_item(db: Session, menu_id: int) -> bool:
    """
    Удаляет элемент меню.
    ВАЖНО: caller должен вызвать db.commit() после удаления.
    """
    item = get_menu_item(db, menu_id)
    if not item:
        return False

    db.delete(item)
    db.flush()  # Не коммитим
    return True