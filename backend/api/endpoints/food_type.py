from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas.food_type import FoodCategoryCreate, FoodCategoryUpdate, FoodCategoryResponse
from crud.food_type import (
    create_food_category,
    get_food_category,
    get_food_categories,
    update_food_category,
    delete_food_category,
    get_food_category_by_name
)
from models.database import get_db
from models.setting_up_db import Users
from core.security import get_current_admin

router = APIRouter(prefix="/food-type", tags=["food_type"])


@router.post(
    "/",
    response_model=FoodCategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать категорию блюд"
)
def create_category(
    category: FoodCategoryCreate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Создаёт новую категорию блюд (только для администраторов).

    - **name**: Название категории (например, "Пицца", "Суши")
    """
    # Проверяем, не существует ли уже категория с таким именем
    existing = get_food_category_by_name(db, category.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Категория '{category.name}' уже существует"
        )

    try:
        db_category = create_food_category(
            db=db,
            name=category.name
        )
        db.commit()
        db.refresh(db_category)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return FoodCategoryResponse(
        category_id=db_category.category_id,
        name=db_category.name
    )


@router.get(
    "/",
    response_model=List[FoodCategoryResponse],
    summary="Получить все категории"
)
def get_all_categories(db: Session = Depends(get_db)):
    """
    Получает список всех категорий блюд.
    Доступно всем авторизованным пользователям.
    """
    categories = get_food_categories(db)
    return [
        FoodCategoryResponse(
            category_id=cat.category_id,
            name=cat.name
        )
        for cat in categories
    ]


@router.get(
    "/{category_id}",
    response_model=FoodCategoryResponse,
    summary="Получить категорию по ID"
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """
    Получает информацию о категории по её ID.
    """
    category = get_food_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена"
        )
    
    return FoodCategoryResponse(
        category_id=category.category_id,
        name=category.name
    )


@router.put(
    "/{category_id}",
    response_model=FoodCategoryResponse,
    summary="Обновить категорию"
)
def update_category(
    category_id: int,
    category_update: FoodCategoryUpdate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Обновляет категорию блюд (только для администраторов).
    
    Можно изменить только название категории.
    """
    # Проверяем существование категории
    existing = get_food_category(db, category_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена"
        )
    
    # Если ничего не обновляется
    if category_update.name is None:
        return FoodCategoryResponse(
            category_id=existing.category_id,
            name=existing.name
        )
    
    try:
        updated_category = update_food_category(
            db=db,
            category_id=category_id,
            name=category_update.name
        )
        db.commit()
        db.refresh(updated_category)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return FoodCategoryResponse(
        category_id=updated_category.category_id,
        name=updated_category.name
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить категорию"
)
def delete_category(
    category_id: int,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Удаляет категорию блюд (только для администраторов).
    
    ⚠️ Нельзя удалить категорию, если в ней есть элементы меню.
    """
    # Проверяем существование категории
    category = get_food_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена"
        )
    
    try:
        success = delete_food_category(db=db, category_id=category_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось удалить категорию"
            )
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {"message": f"Категория '{category.name}' успешно удалена"}
