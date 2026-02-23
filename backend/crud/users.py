import re
from sqlalchemy.orm import Session
from backend.models.setting_up_db import Users
from backend.utils.security import hash_password
from datetime import datetime

# ======================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВАЛИДАЦИИ
# ======================

def _validate_email(email: str) -> str:
    """Валидирует и нормализует email"""
    email = email.strip().lower()
    
    # Базовая проверка формата
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise ValueError("Некорректный формат email")
    
    # Защита от известных проблем
    if len(email) > 254:
        raise ValueError("Email слишком длинный (макс. 254 символа)")
    if '..' in email or email.startswith('.') or email.endswith('.'):
        raise ValueError("Email содержит недопустимые символы")
    
    return email

def _normalize_phone(phone: str) -> str:
    """
    Нормализует телефон к формату +7 (XXX) XXX-XX-XX
    Принимает: +79086430688, 89086430688, 9086430688 и т.д.
    """
    # Удаляем всё кроме цифр и +
    cleaned = re.sub(r'[^\d+]', '', phone.strip())
    
    # Извлекаем только цифры
    digits = re.sub(r'\D', '', cleaned)
    
    # Валидация длины (10-11 цифр для РФ)
    if len(digits) == 10:
        digits = '7' + digits  # Добавляем код страны
    elif len(digits) == 11 and digits.startswith('8'):
        digits = '7' + digits[1:]
    elif len(digits) != 11 or not digits.startswith('7'):
        raise ValueError(
            "Некорректный номер телефона. "
            "Ожидается формат: +79086430688, 89086430688 или 9086430688"
        )
    
    # Форматируем красиво для хранения
    return f"+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"

# ======================
# ОСНОВНЫЕ CRUD-ФУНКЦИИ С ВАЛИДАЦИЕЙ
# ======================

def create_user(
    db: Session,
    username: str,
    password: str,
    name: str,
    surname: str,
    email: str,
    phone: str,
    patronymic: str = None,
    address: str = None
) -> Users:
    # Валидация контактов ПЕРЕД созданием
    validated_email = _validate_email(email)
    normalized_phone = _normalize_phone(phone)
    
    # Проверка уникальности
    if get_user_by_email(db, validated_email):
        raise ValueError(f"Email '{validated_email}' уже зарегистрирован")
    if get_user_by_phone(db, normalized_phone):
        raise ValueError(f"Телефон '{normalized_phone}' уже зарегистрирован")
    
    # Хеширование пароля (уже есть в вашем коде)
    db_user = Users(
        username=username,
        hash_password=hash_password(password),
        name=name,
        surname=surname,
        patronymic=patronymic,
        email=validated_email,      # Сохраняем нормализованный email
        phone=normalized_phone,     # Сохраняем красивый формат телефона
        address=address,
        create_datetime=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, **kwargs) -> Users | None:
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        return None
    
    allowed_fields = {'name', 'surname', 'patronymic', 'address', 'phone', 'email'}
    
    for key, value in kwargs.items():
        if key not in allowed_fields or value is None:
            continue
        
        # Специальная валидация для контактов
        if key == 'email':
            value = _validate_email(value)
            # Проверка уникальности (игнорируем текущего пользователя)
            existing = db.query(Users).filter(
                Users.email == value,
                Users.user_id != user_id
            ).first()
            if existing:
                raise ValueError(f"Email '{value}' уже используется другим пользователем")
        
        elif key == 'phone':
            value = _normalize_phone(value)
            # Проверка уникальности
            existing = db.query(Users).filter(
                Users.phone == value,
                Users.user_id != user_id
            ).first()
            if existing:
                raise ValueError(f"Телефон '{value}' уже используется другим пользователем")
        
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

# ======================
# ДОПОЛНИТЕЛЬНЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ======================

def get_user_by_username(db: Session, username: str) -> Users | None:
    return db.query(Users).filter(Users.username == username).first()

def get_user_by_phone(db: Session, phone: str) -> Users | None:
    """Получает пользователя по НОРМАЛИЗОВАННОМУ телефону"""
    normalized = _normalize_phone(phone)
    return db.query(Users).filter(Users.phone == normalized).first()

def get_user_by_email(db: Session, email: str) -> Users | None:
    email = _validate_email(email)
    return db.query(Users).filter(Users.email == email).first()

def search_users_by_contact(db: Session, query: str) -> list[Users]:
    """
    Поиск пользователей по частичному совпадению email или телефона
    Удобно для админки
    """
    normalized_query = re.sub(r'[^\w@+]', '', query)
    return db.query(Users).filter(
        (Users.email.contains(normalized_query)) |
        (Users.phone.contains(normalized_query))
    ).all()

def delete_user(db: Session, user_id: int) -> bool:
    """Удаляет пользователя"""
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False