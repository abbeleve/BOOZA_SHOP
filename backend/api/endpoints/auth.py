from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_current_user,
    decode_token
)
from core.config import settings
from schemas.auth import UserRegister, UserLogin, Token, RefreshTokenRequest
from crud.users import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_phone
)
from models.database import get_db
from models.setting_up_db import Users

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Проверка уникальности (валидация контактов внутри CRUD)
    if get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username уже занят")
    if get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    if get_user_by_phone(db, user_data.phone):
        raise HTTPException(status_code=400, detail="Телефон уже зарегистрирован")
    
    # Создание пользователя (валидация контактов и хеширование внутри)
    try:
        new_user = create_user(
            db=db,
            username=user_data.username,
            password=user_data.password,
            name=user_data.name,
            surname=user_data.surname,
            email=user_data.email,
            phone=user_data.phone,
            patronymic=user_data.patronymic,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Генерация токенов
    access_token = create_access_token(data={"sub": new_user.username})
    refresh_token = create_refresh_token(data={"sub": new_user.username})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60
    )

@router.post("/login", response_model=Token)
async def login(form_data: UserLogin, db: Session = Depends(get_db)):
    # Поддержка входа по username ИЛИ email
    user = get_user_by_username(db, form_data.username)
    if not user and '@' in form_data.username:
        user = get_user_by_email(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.hash_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя/email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный тип токена",
        )
    
    username: str = payload.get("sub")
    if not username or not get_user_by_username(db, username):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )
    
    new_access_token = create_access_token(data={"sub": username})
    
    return Token(
        access_token=new_access_token,
        refresh_token=request.refresh_token,
        expires_in=settings.access_token_expire_minutes * 60
    )

@router.get("/me")
async def get_current_user_info(current_user: Users = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "name": current_user.name,
        "surname": current_user.surname,
        "patronymic": current_user.patronymic,
        "email": current_user.email,
        "phone": current_user.phone,
        "address": current_user.address,
        "is_staff": current_user.staff is not None,
        "role": current_user.staff.role.name if current_user.staff else None
    }