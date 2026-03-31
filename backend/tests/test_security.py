import pytest
from fastapi.testclient import TestClient
from main import app
from models.database import get_db
from utils.security import hash_password, verify_password
from models.setting_up_db import Users, Staff, Role, FoodType
from datetime import datetime
from jose import jwt
from core.config import settings


@pytest.fixture
def client(test_db_session):
    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides = {}


@pytest.fixture
def test_admin_token(client, test_db_session):    
    user = Users(
        username="test_admin_sec",
        name="Test",
        surname="Admin",
        email="admin-sec@test.com",
        phone="+79990001199",
        hash_password=hash_password("admin123"),
        create_datetime=datetime.now()
    )
    test_db_session.add(user)
    test_db_session.commit()
    
    staff = Staff(username=user.username, role=Role.ADMIN)
    test_db_session.add(staff)
    test_db_session.commit()
    
    response = client.post("/auth/login", json={
        "username": "test_admin_sec",
        "password": "admin123"
    })
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def test_user(test_db_session):
    
    user = Users(
        username="testuser_sec",
        name="Test",
        surname="User",
        email="testuser-sec@example.com",
        phone="+79990001188",
        hash_password=hash_password("password123"),
        create_datetime=datetime.now()
    )
    test_db_session.add(user)
    test_db_session.commit()
    return user

class TestSecurity:
    def test_sql_injection_login(self, client):
        response = client.post("/auth/login", json={
            "username": "admin' OR '1'='1",
            "password": "anything"
        })
        assert response.status_code == 401
    
    def test_xss_in_menu_item(self, client, test_admin_token, test_db_session):
        category = FoodType(category_id=999, name="Test Category")
        test_db_session.add(category)
        test_db_session.commit()
        response = client.post("/menu", data={
            "food_name": "<script>alert('xss')</script>",
            "price": "500",
            "category_id": f"{category.category_id}"
        }, headers={"Authorization": f"Bearer {test_admin_token}"})
        assert response.status_code == 201

    
    def test_password_hashing_strength(self):        
        password = "password123"
        hashed = hash_password(password)
        
        assert hashed != password
        
        hashed2 = hash_password(password)
        assert hashed != hashed2
        
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)
    
    def test_jwt_token_expiration(self, client, test_user):
        login_response = client.post("/auth/login", json={
            "username": "testuser_sec",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        assert "exp" in payload
        assert payload["type"] == "access"
    
    def test_unauthorized_access_to_admin_endpoints(self, client):
        response = client.get("/staff/me")
        assert response.status_code == 401
        
        response = client.post("/menu", data={
            "food_name": "Test",
            "price": "500",
            "category_id": "999"
        })
        assert response.status_code == 401
    
    def test_cors_headers(self, client):
        response = client.options("/auth/login", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST"
        })
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        