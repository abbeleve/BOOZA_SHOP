from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.users import UserResponse
from crud.users import search_users_by_contact, get_user_by_id
from crud.staff import is_staff
from models.setting_up_db import Users
from models.database import get_db
from core.security import get_current_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/customers", response_model=List[UserResponse])
def get_customers(
    search: Optional[str] = Query(None, description="Поиск по имени, email или телефону"),
    current_user: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить список клиентов (не сотрудников)"""
    all_users = db.query(Users).all()
    customers = []
    for user in all_users:
        if not is_staff(db, user.username):
            customers.append(user)
    if search:
        search_lower = search.lower()
        customers = [
            user for user in customers
            if search_lower in user.name.lower() or
               search_lower in user.surname.lower() or
               search_lower in user.email.lower() or
               search_lower in user.phone.lower()
        ]
    return [
        UserResponse(
            user_id=user.user_id,
            username=user.username,
            name=user.name,
            surname=user.surname,
            patronymic=user.patronymic,
            email=user.email,
            phone=user.phone,
            address=user.address,
            is_staff=False,
            role=None
        )
        for user in customers
    ]