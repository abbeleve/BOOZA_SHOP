import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.models.database import get_db_session
from backend.crud.users import create_user, update_user, get_user_by_email
from datetime import time

def test_user():
    with get_db_session() as db:
        user = create_user(
            db=db,
            username="Admin",
            password="adminer",
            name="Админ",
            surname="Админ",
            email="admin@gmail.com",
            phone="77777777777",
            patronymic="Админ",
            address="ул. Админов д. 999"
        )
        print(user)

def _update_user():
    with get_db_session() as db:
        update_user(db=db, user_id=get_user_by_email(db=db, email="burger@gmail.com").user_id, phone="79086430688")

if __name__ == "__main__":
    _update_user()