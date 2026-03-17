from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderShortResponse,
    OrderStatusUpdate,
    OrderStatusEnum
)
from crud.orders import (
    create_order,
    get_order_by_id,
    get_orders_by_user,
    get_all_orders,
    update_order_status,
    cancel_order,
    complete_order,
    delete_order,
    get_order_details
)
from models.database import get_db
from models.setting_up_db import Users, Status
from core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["orders"])


def _convert_status_to_enum(status_str: OrderStatusEnum) -> Status:
    """Конвертирует статус из схемы в enum БД"""
    return Status[status_str.name]


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать новый заказ"
)
def create_new_order(
    order_data: OrderCreate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создаёт новый заказ от имени текущего пользователя.

    - **delivery_address**: Адрес доставки (мин. 5 символов)
    - **items**: Список блюд (минимум 1)
    - **description**: Опциональный комментарий к заказу
    - **phone**: Номер телефона для связи (мин. 10 символов)
    """
    # Конвертируем схемы в dict для CRUD
    items = [
        {"menu_item_id": item.menu_item_id, "quantity": item.quantity}
        for item in order_data.items
    ]

    try:
        order = create_order(
            db=db,
            user_id=current_user.user_id,
            delivery_address=order_data.delivery_address,
            items=items,
            description=order_data.description,
            phone=order_data.phone
        )
        db.commit()
        db.refresh(order)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Формируем ответ с элементами
    order_details = get_order_details(db, order.order_id)
    if not order_details:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось получить данные заказа после создания"
        )

    return _map_order_details_to_response(order_details)


@router.get(
    "/my",
    response_model=List[OrderShortResponse],
    summary="Мои заказы"
)
def get_my_orders(
    status_filter: Optional[OrderStatusEnum] = None,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получает список всех заказов текущего пользователя.
    
    - **status**: Опциональная фильтрация по статусу
    """
    db_status = _convert_status_to_enum(status_filter) if status_filter else None
    orders = get_orders_by_user(db, current_user.user_id, db_status)
    
    return [
        OrderShortResponse(
            order_id=order.order_id,
            status=order.status.name,
            create_datetime=order.create_datetime,
            total_amount=order.total_amount,
            delivery_address=order.delivery_address,
            items_count=len(order.items)
        )
        for order in orders
    ]


@router.get(
    "/",
    response_model=List[OrderShortResponse],
    summary="Все заказы (ADMIN)"
)
def get_all_orders_endpoint(
    status_filter: Optional[OrderStatusEnum] = None,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает список всех заказов в системе (только для администраторов).
    
    - **status**: Опциональная фильтрация по статусу
    """
    db_status = _convert_status_to_enum(status_filter) if status_filter else None
    orders = get_all_orders(db, db_status)
    
    return [
        OrderShortResponse(
            order_id=order.order_id,
            status=order.status.name,
            create_datetime=order.create_datetime,
            total_amount=order.total_amount,
            delivery_address=order.delivery_address,
            items_count=len(order.items)
        )
        for order in orders
    ]


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Заказ по ID"
)
def get_order(
    order_id: int,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получает полную информацию о заказе по ID.
    
    Пользователь может просматривать только свои заказы.
    Администратор может просматривать любые заказы.
    """
    order_details = get_order_details(db, order_id)
    if not order_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    
    # Проверка прав: пользователь может смотреть только свои заказы
    is_admin = current_user.staff is not None
    if not is_admin and order_details["user"]["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для просмотра этого заказа"
        )
    
    return _map_order_details_to_response(order_details)


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="Обновить статус заказа (ADMIN)"
)
def update_order_status_endpoint(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Обновляет статус заказа (только для администраторов).

    Доступные статусы:
    - **ACCEPTED**: Принят в работу
    - **COOKING**: Готовится
    - **DELIVERING**: Доставляется
    - **COMPLETED**: Выполнен
    - **CANCELLED**: Отменён

    ⚠️ Отменённый заказ нельзя изменить на другой статус.
    """
    # Проверяем существование заказа
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    
    db_status = _convert_status_to_enum(status_data.status)
    
    try:
        updated_order = update_order_status(db, order_id, db_status)
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )
        db.commit()
        db.refresh(updated_order)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    order_details = get_order_details(db, updated_order.order_id)
    return _map_order_details_to_response(order_details)


@router.post(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    summary="Отменить заказ (ADMIN)"
)
def cancel_order_endpoint(
    order_id: int,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Отменяет заказ (только для администраторов).
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    
    try:
        updated_order = cancel_order(db, order_id)
        db.commit()
        db.refresh(updated_order)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    order_details = get_order_details(db, updated_order.order_id)
    return _map_order_details_to_response(order_details)


@router.post(
    "/{order_id}/complete",
    response_model=OrderResponse,
    summary="Завершить заказ (ADMIN)"
)
def complete_order_endpoint(
    order_id: int,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Завершает заказ (только для администраторов).
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    
    try:
        updated_order = complete_order(db, order_id)
        db.commit()
        db.refresh(updated_order)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    order_details = get_order_details(db, updated_order.order_id)
    return _map_order_details_to_response(order_details)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить заказ (ADMIN)"
)
def delete_order_endpoint(
    order_id: int,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Удаляет заказ и все его элементы (только для администраторов).

    ⚠️ Можно удалять только заказы со статусом ACCEPTED или CANCELLED.
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    
    try:
        success = delete_order(db, order_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось удалить заказ"
            )
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return None


# ======================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ======================

def _map_order_details_to_response(order_details: dict) -> OrderResponse:
    """Конвертирует словарь get_order_details в OrderResponse"""
    return OrderResponse(
        order_id=order_details["order_id"],
        status=order_details["status"],
        create_datetime=order_details["create_datetime"],
        end_datetime=order_details["end_datetime"],
        delivery_address=order_details["delivery_address"],
        phone=order_details["phone"],
        total_amount=order_details["total_amount"],
        description=order_details["description"],
        items=[
            {
                "order_food_id": item["order_food_id"],
                "menu_item_id": item["menu_item_id"],
                "food_name": item["food_name"],
                "quantity": item["quantity"],
                "price_per_item": item["price_per_item"],
                "total": item["total"],
                "image_url": item["image_url"]
            }
            for item in order_details["items"]
        ]
    )
