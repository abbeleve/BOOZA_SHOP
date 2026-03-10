from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas.food_type import FoodTypeResponse
from crud.food_type import get_food_categories
from models.database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[FoodTypeResponse])
def read_categories(db: Session = Depends(get_db)):
    """
    Получает список всех категорий.
    """
    categories = get_food_categories(db=db)
    return categories
