import pytest
import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.setting_up_db import Base, Users, MenuItems, Order
from schemas.menu import MenuItemCreate
from utils.security import hash_password
from datetime import datetime

@pytest.fixture
def test_db():
    login=os.getenv("POSTGRES_USER")
    password=os.getenv("POSTGRES_PASSWORD")
    host=os.getenv("POSTGRES_HOST")
    port=os.getenv("POSTGRES_PORT")
    postgres_db=os.getenv("POSTGRES_DB")
    TEST_DATABASE_URL=f"postgresql://{login}:{password}@{host}:{port}/{postgres_db}"
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

def test_user_creation(test_db):
    unique_suffix = str(uuid.uuid4())[:8]
    user = Users(
        username=f"user_test_{unique_suffix}",
        name="Иван",              
        surname="Иванов",   
        patronymic="Иванович",    
        email="test@example.com",
        phone="89345278947",
        hash_password=hash_password("TestPassword123"),
        address="пр-кт. Лиговский, 48",
        create_datetime=datetime.now() 
    )
    test_db.add(user)
    test_db.commit()
    assert user.user_id is not None
    assert user.email == "test@example.com"
    assert user.name == "Иван"

def test_menu_item_validation():
    item = MenuItemCreate(
        food_name="Тестовое блюдо",
        price=500,
        category_id=1,
        is_available=True
    )
    assert item.price > 0
    assert item.food_name != ""