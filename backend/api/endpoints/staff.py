from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.staff import StaffCreate, StaffResponse, StaffUpdate, RoleEnum, PasswordChange
from crud.staff import create_staff, get_staff_by_username, get_staff_with_details, get_all_staff, update_staff_role, delete_staff, is_staff
from crud.users import get_user_by_username, update_user, get_user_by_id
from models.setting_up_db import Role as DBRole, Users
from models.database import get_db
from core.security import get_current_admin
from utils.security import verify_password, hash_password

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
    - ADMIN может создавать ADMIN и STAFF
    - STAFF может создавать только STAFF
    """
    if staff_data.role == RoleEnum.ADMIN:
        current_staff = get_staff_by_username(db, current_user.username)
        if current_staff and current_staff.role != DBRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только администратор может назначать администраторов"
            )
    
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
    db.commit()
    
    staff_details = get_staff_with_details(db, staff_data.username)
    if not staff_details:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось получить данные о сотруднике после создания"
        )
    
    return StaffResponse(**staff_details)


@router.delete("/{username}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_member(
    username: str,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Удалить сотрудника.
    - ADMIN может удалять ADMIN и STAFF
    - STAFF может удалять только STAFF
    """
    staff = get_staff_by_username(db, username)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сотрудник с username '{username}' не найден"
        )
    
    if username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить самого себя"
        )
    
    if staff.role == DBRole.ADMIN:
        current_staff = get_staff_by_username(db, current_user.username)
        if current_staff and current_staff.role != DBRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только администратор может удалять администраторов"
            )
    
    delete_staff(db, username=username)
    db.commit()
    return None


@router.put("/{username}", response_model=StaffResponse)
def update_staff_member(
    username: str,
    staff_data: StaffUpdate,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Обновить данные сотрудника.
    - ADMIN может обновлять ADMIN и STAFF
    - STAFF может обновлять только STAFF
    """
    staff = get_staff_by_username(db, username)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сотрудник с username '{username}' не найден"
        )
    
    if staff.role == DBRole.ADMIN:
        current_staff = get_staff_by_username(db, current_user.username)
        if current_staff and current_staff.role != DBRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только администратор может изменять данные администраторов"
            )
    
    if staff_data.role == RoleEnum.ADMIN:
        current_staff = get_staff_by_username(db, current_user.username)
        if current_staff and current_staff.role != DBRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только администратор может назначать администраторов"
            )
    
    update_data = {key: value for key, value in staff_data.dict(exclude_unset=True).items() if value is not None}
    if update_data:
        updated_user = update_user(db, user_id=staff.user.user_id, **update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ошибка при обновлении данных"
            )
    
    if staff_data.role:
        role_enum = DBRole[staff_data.role.name]
        update_staff_role(db, username=username, new_role=role_enum)
    
    db.commit()
    staff_details = get_staff_with_details(db, username)
    return StaffResponse(**staff_details)

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


@router.get("/", response_model=List[StaffResponse])
def get_all_staff_members(
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить всех сотрудников (только для администраторов)"""
    staff_list = get_all_staff(db)
    return [get_staff_with_details(db, staff.username) for staff in staff_list]

@router.get("/{username}", response_model=StaffResponse)
def get_staff_member(
    username: str,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить информацию о сотруднике"""
    staff_details = get_staff_with_details(db, username)
    if not staff_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сотрудник с username '{username}' не найден"
        )
    return StaffResponse(**staff_details)

@router.post("/{username}/change-password")
def change_staff_password(
    username: str,
    password_data: dict,
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Изменить пароль сотрудника"""
    from utils.security import verify_password, hash_password
    from crud.users import update_user, get_user_by_username
    
    staff = get_staff_by_username(db, username)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сотрудник с username '{username}' не найден"
        )
    
    user = staff.user
    
    # Проверяем текущий пароль
    if not verify_password(password_data.get('old_password', ''), user.hash_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )
    
    # Обновляем пароль
    new_password = password_data.get('new_password', '')
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль должен содержать минимум 6 символов"
        )
    
    update_data = {"hash_password": hash_password(new_password)}
    updated_user = update_user(db, user_id=user.user_id, **update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при изменении пароля"
        )
    
    db.commit()
    return {"message": "Пароль успешно изменён"}
