import pytest
from fastapi.testclient import TestClient
from main import app
from models.database import get_db
from models.setting_up_db import Users, Staff, Role, FoodType, MenuItems, Order, OrderItems, Status
from utils.security import hash_password
from datetime import datetime, timedelta, time

@pytest.fixture
def client_with_analytics_data(test_db_session):
    admin = Users(
        username="admin",
        hash_password=hash_password("admin123"),
        name="Admin",
        surname="Adminov",
        email="admin@example.com",
        phone="+7 (908) 643-06-89",
        create_datetime=datetime.now()
    )
    test_db_session.add(admin)
    test_db_session.add(Staff(username="admin", role=Role.ADMIN))
    
    category = FoodType(category_id=1, name="Пицца")
    test_db_session.add(category)
    
    menu_item = MenuItems(
        menu_id=1,
        food_name="Маргарита",
        price=500,
        category_id=1,
        preparation_time=time(0, 15),
        is_available=True
    )
    test_db_session.add(menu_item)
    
    user = Users(
        user_id=33,
        username="customer",
        hash_password=hash_password("password123"),
        name="Customer",
        surname="Test",
        email="customer@example.com",
        phone="+7 (908) 643-06-88",
        create_datetime=datetime.now()
    )
    test_db_session.add(user)

    today = datetime.now()
    for i in range(5):
        order = Order(
            user_id=user.user_id,
            delivery_address="г. Москва",
            phone="+7 (908) 643-06-88",
            total_amount=1000,
            status=Status.COMPLETED,
            create_datetime=today + timedelta(hours=i)
        )
        test_db_session.add(order)
        
        test_db_session.flush()
        order_item = OrderItems(
            order_id=order.order_id,
            menu_item_id=1,
            quantity=2,
            price=500
        )
        test_db_session.add(order_item)
    
    test_db_session.commit()
    
    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides = {}

class TestAnalyticsAPI:
    def test_get_dashboard_analytics_admin(self, client_with_analytics_data):
        login_response = client_with_analytics_data.post("/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = login_response.json()["access_token"]
        
        response = client_with_analytics_data.get("/analytics/dashboard", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "today" in data
        assert "month" in data
        assert "daily_dynamics" in data
        assert "top_menu_items" in data
        
        assert data["today"]["orders_count"] == 5
    
    def test_get_dashboard_analytics_unauthorized(self, client_with_analytics_data):
        response = client_with_analytics_data.get("/analytics/dashboard")
        assert response.status_code == 401
    
    def test_get_dashboard_analytics_regular_user(self, client_with_analytics_data):
        login_response = client_with_analytics_data.post("/auth/login", json={
            "username": "customer",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        
        response = client_with_analytics_data.get("/analytics/dashboard", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert response.status_code == 403
    
    def test_get_period_statistics(self, client_with_analytics_data):
        login_response = client_with_analytics_data.post("/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = login_response.json()["access_token"]
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = client_with_analytics_data.get(
            f"/analytics/period?start_date={today}&end_date={today}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "orders_count" in data
        assert "total_revenue" in data
        assert data["orders_count"] == 5
        assert data["total_revenue"] == 5000 
    
    def test_get_most_popular_item(self, client_with_analytics_data):
        response = client_with_analytics_data.get("/analytics/most-popular")
        
        assert response.status_code == 200
        data = response.json()
        assert "menu_item_id" in data
        assert "food_name" in data
        assert data["food_name"] == "Маргарита"