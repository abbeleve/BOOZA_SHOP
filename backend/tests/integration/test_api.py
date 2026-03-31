import pytest
from fastapi.testclient import TestClient
from models.database import get_db
from models.setting_up_db import FoodType, MenuItems, Users, Staff, Role, Order, Status
from main import app
from utils.security import hash_password
from datetime import datetime, time


@pytest .fixture
def client(test_db_session):
    """TestClient с переопределённой зависимостью get_db"""
    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def test_admin(test_db_session):
    """Создаёт тестового админа в БД"""
    existing = test_db_session.query(Users).filter(Users.username == "test_admin").first()
    if existing:
        return existing
    
    user = Users(
        username="test_admin",
        name="Админ",
        surname="Админов",
        email="admin@test.com",
        phone="+79990001122",
        hash_password=hash_password("admin123"),
        create_datetime=datetime.now()
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    
    staff = Staff(username=user.username, role=Role.ADMIN)    
    test_db_session.add(staff)
    test_db_session.commit()
    
    return user

@pytest.fixture
def auth_token(test_admin, client):
    response = client.post("/auth/login", json={
        "username": "test_admin",
        "password": "admin123"
    })
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        pytest.fail(f"Login failed: {response.text}")

    
    return response.json()["access_token"]

class TestMenuAPI:
    def test_get_categories(self, client):
        response = client.get("/food-type")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_category_authenticated(self, auth_token, client):
        response = client.post(
            "/food-type",
            json={"name": "Новая категория"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 201
    
    def test_create_category_unauthenticated(self, client):
        response = client.post(
            "/food-type",
            json={"name": "Новая категория"}
        )
        assert response.status_code == 401
    
    def test_get_menu_items(self, client):
        response = client.get("/menu")
        assert response.status_code == 200
    
    def test_create_menu_item(self, auth_token, client, test_db_session):
        category = FoodType(category_id=999, name="Тестовая")
        test_db_session.add(category)
        test_db_session.commit()
        
        response = client.post(
            "/menu",
            data={
                "food_name": "Тестовое блюдо",
                "price": "500",
                "category_id": "999",
                "description": "Тестовое описание",
                "is_available": "true",
                "preparation_time_minutes": "15"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["food_name"] == "Тестовое блюдо"
        assert data["price"] == 500

class TestOrderAPI:
    def test_create_order(self, auth_token, client, test_db_session):
        category = FoodType(category_id=999, name="Тестовая")
        test_db_session.add(category)
        test_db_session.commit()

        menu_item = MenuItems(
            food_name="Тестовое блюдо",
            price=500,
            category_id=category.category_id,
            preparation_time=time(0, 30),
            is_available=True
        )
        test_db_session.add(menu_item)
        test_db_session.commit()
        test_db_session.refresh(menu_item)

        response = client.post(
            "/orders",
            json={
                "delivery_address": "пр-кт. Невский, 1",
                "phone": "+79991234567",
                "items": [{"menu_item_id": menu_item.menu_id, "quantity": 2}]
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert "order_id" in data
        assert data["total_amount"] == 1000 
    
    def test_get_order_history(self, auth_token, client):
        response = client.get(
            "/orders/my",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
    
    def test_update_order_status(self, auth_token, client, test_db_session):
        user = test_db_session.query(Users).filter(Users.username == "test_admin").first()
        
        order = Order(
            user_id=user.user_id,
            delivery_address="ул. Тестовая, 1",
            phone="+79991234567",
            total_amount=500,
            status=Status.ACCEPTED 
        )
        test_db_session.add(order)
        test_db_session.commit()
        test_db_session.refresh(order)
        id = order.order_id
        response = client.patch(
            f"/orders/{id}/status",
            json={"status": "COOKING"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "COOKING"