from sqlalchemy.orm import Session
from backend.models.setting_up_db import Staff, Users, Role
from typing import Optional, List
from enum import Enum

def create_staff(
    db: Session,
    username: str,
    role: Role
) -> Staff:
    """
    Создаёт запись сотрудника.
    Требует: пользователь с таким username уже существует в Users.
    """
    # Проверяем существование пользователя
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        raise ValueError(f"Пользователь с username '{username}' не существует")
    
    # Проверяем, не является ли пользователь уже сотрудником
    existing_staff = get_staff_by_username(db, username)
    if existing_staff:
        raise ValueError(f"Пользователь '{username}' уже является сотрудником")
    
    # Создаём запись сотрудника
    staff = Staff(username=username, role=role)
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

def get_staff_by_username(db: Session, username: str) -> Optional[Staff]:
    """Получает запись сотрудника по username"""
    return db.query(Staff).filter(Staff.username == username).first()

def get_staff_by_user_id(db: Session, user_id: int) -> Optional[Staff]:
    """Получает запись сотрудника по user_id (через связь с Users)"""
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        return None
    return user.staff  # Используем relationship

def get_all_staff(db: Session, role: Optional[Role] = None) -> List[Staff]:
    """Получает всех сотрудников (с фильтрацией по роли)"""
    query = db.query(Staff)
    if role:
        query = query.filter(Staff.role == role)
    return query.all()

def update_staff_role(
    db: Session,
    username: str,
    new_role: Role
) -> Optional[Staff]:
    """Обновляет роль сотрудника"""
    staff = get_staff_by_username(db, username)
    if not staff:
        return None
    
    staff.role = new_role
    db.commit()
    db.refresh(staff)
    return staff

def delete_staff(db: Session, username: str) -> bool:
    """
    Удаляет запись сотрудника (НЕ удаляет пользователя из Users!).
    После удаления пользователь остаётся в системе как обычный клиент.
    """
    staff = get_staff_by_username(db, username)
    if not staff:
        return False
    
    db.delete(staff)
    db.commit()
    return True

def is_staff(db: Session, username: str) -> bool:
    """Проверяет, является ли пользователь сотрудником"""
    return get_staff_by_username(db, username) is not None

def get_staff_with_details(db: Session, username: str) -> Optional[dict]:
    """
    Получает полную информацию о сотруднике (включая данные пользователя)
    Возвращает словарь с данными или None
    """
    staff = get_staff_by_username(db, username)
    if not staff:
        return None
    
    return {
        "username": staff.username,
        "role": staff.role.name,
        "user_id": staff.user.user_id,
        "name": staff.user.name,
        "surname": staff.user.surname,
        "email": staff.user.email,
        "phone": staff.user.phone
    }