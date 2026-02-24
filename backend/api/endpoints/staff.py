# backend/api/endpoints/staff.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.staff import StaffCreate, StaffResponse, RoleEnum
from crud.staff import create_staff, get_staff_by_username, get_staff_with_details
from crud.users import get_user_by_username
from models.setting_up_db import Role as DBRole, Users
from models.database import get_db
from core.security import get_current_admin

router = APIRouter(prefix="/staff", tags=["staff"])

@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff_member(
    staff_data: StaffCreate,
    current_user: Users = Depends(get_current_admin),  # Только администратор может создавать сотрудников
    db: Session = Depends(get_db)
):
    """
    Назначает существующего пользователя сотрудником.
    Требует: пользователь уже зарегистрирован в системе.
    """
    # Проверяем существование пользователя
    user = get_user_by_username(db, staff_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с username '{staff_data.username}' не найден. Сначала зарегистрируйте пользователя."
        )
    
    # Проверяем, не является ли пользователь уже сотрудником
    if get_staff_by_username(db, staff_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Пользователь '{staff_data.username}' уже является сотрудником"
        )
    
    # Конвертируем роль из схемы в модель БД
    role_enum = DBRole[staff_data.role.name]
    
    # Создаём запись сотрудника
    try:
        create_staff(db, username=staff_data.username, role=role_enum)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Возвращаем полную информацию о сотруднике
    staff_details = get_staff_with_details(db, staff_data.username)
    if not staff_details:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось получить данные о сотруднике после создания"
        )
    
    return StaffResponse(
        username=staff_details["username"],
        role=staff_details["role"],
        user_id=staff_details["user_id"],
        name=staff_details["name"],
        surname=staff_details["surname"],
        email=staff_details["email"],
        phone=staff_details["phone"]
    )

@router.get("/me", response_model=StaffResponse)
def get_current_staff_info(
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получает информацию о текущем пользователе как о сотруднике.
    """
    staff_details = get_staff_with_details(db, current_user.username)
    if not staff_details:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав сотрудника"
        )
    return StaffResponse(**staff_details)