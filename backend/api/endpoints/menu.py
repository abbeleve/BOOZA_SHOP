from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import time
import os
import uuid
from pathlib import Path

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

# Папка для изображений
STATIC_DIR = Path(__file__).parent.parent.parent / "static" / "images"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# Маппинг category_id -> папка для изображений
CATEGORY_FOLDERS = {
    1: "pizza",
    2: "sushi",
    3: "drinks",
    4: "snacks",
    5: "desserts",
    6: "salads",
    7: "soups",
    8: "hot",
    9: "pasta",
    10: "burgers",
}


def _validate_file(file: UploadFile) -> str:
    """Проверяет файл и возвращает расширение"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл не указан"
        )
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый формат. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    return ext


def _save_image(file: UploadFile, category: str) -> str:
    """
    Сохраняет изображение и возвращает путь для БД.
    """
    ext = _validate_file(file)
    
    # Создаём уникальное имя файла
    filename = f"{uuid.uuid4().hex}{ext}"
    
    # Создаём папку категории если нет
    category_dir = STATIC_DIR / category
    category_dir.mkdir(parents=True, exist_ok=True)
    
    # Путь для сохранения
    file_path = category_dir / filename
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    # Возвращаем URL для БД
    return f"/static/images/{category}/{filename}"


def _delete_image(image_url: str) -> bool:
    """
    Удаляет изображение с диска.
    """
    try:
        # Преобразуем URL в путь: /static/images/pizza/abc.jpg -> static/images/pizza/abc.jpg
        rel_path = image_url.lstrip('/')
        file_path = Path(__file__).parent.parent.parent / rel_path
        
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    return False


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(..., description="Изображение блюда"),
    category_id: Optional[int] = Form(None, description="ID категории (автоматически определит папку)"),
    category: Optional[str] = Form(None, description="Название папки категории (если category_id не указан)"),
    current_user: Users = Depends(get_current_admin)
):
    """
    Загружает изображение блюда и возвращает URL для сохранения в БД.
    
    Можно передать:
    - **category_id**: ID категории (1=pizza, 2=sushi, и т.д.)
    - **category**: Название папки вручную
    
    Требует: права администратора.
    """
    # Определяем папку категории
    if category_id:
        category_folder = CATEGORY_FOLDERS.get(category_id)
        if not category_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Категория с ID {category_id} не найдена"
            )
    elif category:
        category_folder = category
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Укажите category_id или category"
        )
    
    try:
        image_url = _save_image(file, category_folder)
        return {
            "image_url": image_url,
            "filename": Path(image_url).name,
            "category": category_folder
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки: {str(e)}"
        )

@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item_endpoint(
    food_name: str = Form(..., min_length=1, max_length=100, description="Название блюда"),
    price: int = Form(..., gt=0, description="Цена в рублях"),
    category_id: int = Form(..., gt=0, description="ID категории"),
    description: Optional[str] = Form(None, max_length=500, description="Описание блюда"),
    image: Optional[UploadFile] = File(None, description="Изображение блюда"),
    is_available: bool = Form(True, description="Доступно ли блюдо для заказа"),
    preparation_time_minutes: int = Form(15, ge=1, le=180, description="Время приготовления в минутах"),
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Создаёт новый элемент меню (только для администраторов).
    
    Отправлять как **multipart/form-data**:
    - food_name, price, category_id, description, is_available, preparation_time_minutes
    - image (файл, опционально)
    """
    # Проверяем существование категории
    category = get_food_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Категория с ID {category_id} не существует"
        )

    # Конвертируем минуты в time объект
    preparation_time = time(0, preparation_time_minutes) if preparation_time_minutes else None

    # Обрабатываем изображение если загружено
    image_url = None
    if image:
        category_folder = CATEGORY_FOLDERS.get(category_id)
        if not category_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неизвестная категория с ID {category_id}"
            )
        image_url = _save_image(image, category_folder)

    # Создаём элемент меню
    db_item = create_menu_item(
        db=db,
        food_name=food_name,
        price=price,
        category_id=category_id,
        description=description,
        image_url=image_url,
        is_available=is_available,
        preparation_time=preparation_time
    )
    
    db.commit()
    db.refresh(db_item)

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
    food_name: Optional[str] = Form(None, min_length=1, max_length=100),
    price: Optional[int] = Form(None, gt=0),
    category_id: Optional[int] = Form(None, gt=0),
    description: Optional[str] = Form(None, max_length=500),
    image: Optional[UploadFile] = File(None, description="Новое изображение (заменит старое)"),
    is_available: Optional[bool] = Form(None),
    preparation_time_minutes: Optional[int] = Form(None, ge=1, le=180),
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Обновляет элемент меню (только для администраторов).
    
    Отправлять как **multipart/form-data**.
    Можно загрузить новое изображение — оно заменит старое.
    """
    # Проверяем существование элемента
    existing_item = get_menu_item(db, menu_id)
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )

    # Если обновляется категория, проверяем её существование
    if category_id and category_id != existing_item.category_id:
        category = get_food_category(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Категория с ID {category_id} не существует"
            )

    # Конвертируем минуты в time если указано
    preparation_time = None
    if preparation_time_minutes is not None:
        preparation_time = time(0, preparation_time_minutes)

    # Обрабатываем новое изображение если загружено
    image_url = existing_item.image_url  # Оставляем старое по умолчанию
    if image:
        category_folder = CATEGORY_FOLDERS.get(category_id or existing_item.category_id)
        if not category_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неизвестная категория с ID {category_id or existing_item.category_id}"
            )
        
        # Удаляем старое изображение если есть
        if existing_item.image_url:
            _delete_image(existing_item.image_url)
        
        # Сохраняем новое
        image_url = _save_image(image, category_folder)

    # Обновляем элемент
    updated_item = update_menu_item(
        db=db,
        menu_id=menu_id,
        food_name=food_name,
        description=description,
        image_url=image_url,  # Новое или старое
        is_available=is_available,
        price=price,
        preparation_time=preparation_time,
        category_id=category_id
    )

    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )
    
    db.commit()
    db.refresh(updated_item)

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
    Удаляет элемент меню и его изображение (только для администраторов).
    """
    # Проверяем существование элемента
    item = get_menu_item(db, menu_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Элемент меню с ID {menu_id} не найден"
        )

    # Удаляем изображение если есть
    if item.image_url:
        _delete_image(item.image_url)

    # Удаляем элемент
    success = delete_menu_item(db, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось удалить элемент меню"
        )

    return {"message": "Элемент меню успешно удалён"}