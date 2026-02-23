from sqlalchemy.orm import Session
from models.setting_up_db import FoodType
from typing import Optional, List

def create_food_category(db: Session, category_id: int, name: str) -> FoodType:
    """Создаёт новую категорию еды"""
    if get_food_category_by_name(db, name):
        raise ValueError(f"Категория '{name}' уже существует")
    if get_food_category(db, category_id=category_id):
        raise ValueError(f"Категория с ID: {category_id} уже существует")
    category = FoodType(category_id=category_id, name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def get_food_category(db: Session, category_id: int) -> Optional[FoodType]:
    """Получает категорию по ID"""
    return db.query(FoodType).filter(FoodType.category_id == category_id).first()

def get_food_category_by_name(db: Session, name: str) -> Optional[FoodType]:
    """Получает категорию по названию"""
    return db.query(FoodType).filter(FoodType.name == name).first()

def get_food_categories(db: Session) -> List[FoodType]:
    """Получает все категории"""
    return db.query(FoodType).all()

def update_food_category(
    db: Session, 
    category_id: int, 
    name: Optional[str] = None
) -> Optional[FoodType]:
    """Обновляет категорию"""
    category = get_food_category(db, category_id)
    if not category:
        return None
    
    if name and name != category.name:
        if get_food_category_by_name(db, name):
            raise ValueError(f"Категория '{name}' уже существует")
        category.name = name
    
    db.commit()
    db.refresh(category)
    return category

def delete_food_category(db: Session, category_id: int) -> bool:
    """Удаляет категорию (только если нет привязанных элементов меню)"""
    category = get_food_category(db, category_id)
    if not category:
        return False
    
    if category.menu_items:  # Проверка связанных элементов
        raise ValueError(
            f"Нельзя удалить категорию '{category.name}': "
            f"есть {len(category.menu_items)} привязанных элементов меню"
        )
    
    db.delete(category)
    db.commit()
    return True