from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import time

from schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from crud.menu import (
    create_menu_item,
    get_menu_items,
    get_menu_item,
    update_menu_item,
    delete_menu_item
)
from crud.food_type import get_food_category
from models.database import get_db
from models.setting_up_db import Users
from core.security import get_current_admin

router = APIRouter(prefix="/menu", tags=["menu"])

@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item_endpoint(
    item: MenuItemCreate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Создаёт новый элемент меню (только для администраторов).
    """
    # Проверяем существование категории
    category = get_food_category(db, item.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Категория с ID {item.category_id} не существует"
        )
    
    # Конвертируем минуты в time объект
    preparation_time = time(0, item.preparation_time_minutes) if item.preparation_time_minutes else None
    
    # Создаём элемент меню
    db_item = create_menu_item(
        db=db,
        food_name=item.food_name,
        price=item.price,
        category_id=item.category_id,
        description=item.description,
        image_url=item.image_url,
        is_available=item.is_available,
        preparation_time=preparation_time
    )
    
    # Формируем ответ
    return MenuItemResponse(
        menu_id=db_item.menu_id,
        food_name=db_item.food_name,
        price=db_item.price,
        category_id=db_item.category_id,
        description=db_item.description,
        image_url=db_item.image_url,
        is_available=db_item.is_available,
        preparation_time=str(db_item.preparation_time),
        category_name=db_item.category.name if db_item.category else None
    )

@router.get("/", response_model=List[MenuItemResponse])
def read_menu_items(
    category_id: Optional[int] = None,
    available_only: bool = True,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Получает список элементов меню с фильтрацией.
    """
    items = get_menu_items(
        db=db,
        category_id=category_id,
        available_only=available_only,
        min_price=min_price,
        max_price=max_price
    )
    
    return [
        MenuItemResponse(
            menu_id=item.menu_id,
            food_name=item.food_name,
            price=item.price,
            category_id=item.category_id,
            description=item.description,
            image_url=item.image_url,
            is_available=item.is_available,
            preparation_time=str(item.preparation_time),
            category_name=item.category.name if item.category else None
        )
        for item in items
    ]

@router.get("/{menu_id}", response_model=MenuItemResponse)
def read_menu_item(menu_id: int, db: Session = Depends(get_db)):
    """
    Получает элемент меню по ID.
    """
    item = get_menu_item(db, menu_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )
    
    return MenuItemResponse(
        menu_id=item.menu_id,
        food_name=item.food_name,
        price=item.price,
        category_id=item.category_id,
        description=item.description,
        image_url=item.image_url,
        is_available=item.is_available,
        preparation_time=str(item.preparation_time),
        category_name=item.category.name if item.category else None
    )

@router.put("/{menu_id}", response_model=MenuItemResponse)
def update_menu_item_endpoint(
    menu_id: int,
    item_update: MenuItemUpdate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Обновляет элемент меню (только для администраторов).
    """
    # Проверяем существование элемента
    existing_item = get_menu_item(db, menu_id)
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )
    
    # Если обновляется категория, проверяем её существование
    if item_update.category_id and item_update.category_id != existing_item.category_id:
        category = get_food_category(db, item_update.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Категория с ID {item_update.category_id} не существует"
            )
    
    # Конвертируем минуты в time если указано
    preparation_time = None
    if item_update.preparation_time_minutes is not None:
        preparation_time = time(0, item_update.preparation_time_minutes)
    
    # Обновляем элемент
    updated_item = update_menu_item(
        db=db,
        menu_id=menu_id,
        food_name=item_update.food_name,
        description=item_update.description,
        image_url=item_update.image_url,
        is_available=item_update.is_available,
        price=item_update.price,
        preparation_time=preparation_time,
        category_id=item_update.category_id
    )
    
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )
    
    return MenuItemResponse(
        menu_id=updated_item.menu_id,
        food_name=updated_item.food_name,
        price=updated_item.price,
        category_id=updated_item.category_id,
        description=updated_item.description,
        image_url=updated_item.image_url,
        is_available=updated_item.is_available,
        preparation_time=str(updated_item.preparation_time),
        category_name=updated_item.category.name if updated_item.category else None
    )

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item_endpoint(
    menu_id: int,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Удаляет элемент меню (только для администраторов).
    """
    # Проверяем существование элемента
    item = get_menu_item(db, menu_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )
    
    # Удаляем элемент
    success = delete_menu_item(db, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось удалить элемент меню"
        )
    
    return {"message": "Элемент меню успешно удалён"}