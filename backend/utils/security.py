# backend/utils/security.py
from passlib.context import CryptContext

# Используем pbkdf2_sha256 — не требует внешних зависимостей, нет ограничения в 72 байта
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
    pbkdf2_sha256__min_rounds=100000  # Рекомендуемое количество итераций для безопасности
)

def hash_password(password: str) -> str:
    """
    Хеширует пароль.
    Защита от DoS: обрезаем до 1024 символов (достаточно для любых паролей).
    """
    if not password or not isinstance(password, str):
        raise ValueError("Пароль должен быть непустой строкой")
    
    # Защита от атак через очень длинные пароли
    password = password[:1024]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет пароль с той же логикой обрезки"""
    if not plain_password or not isinstance(plain_password, str):
        return False
    
    plain_password = plain_password[:1024]
    return pwd_context.verify(plain_password, hashed_password)