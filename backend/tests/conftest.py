import pytest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.database import get_db
from models.setting_up_db import Base, Users, Staff, MenuItems, Order
from main import app
from fastapi.testclient import TestClient
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))
os.chdir(backend_dir)

login=os.getenv("POSTGRES_USER")
password=os.getenv("POSTGRES_PASSWORD")
host=os.getenv("POSTGRES_HOST")
port=os.getenv("POSTGRES_PORT")
postgres_db=os.getenv("POSTGRES_DB")
TEST_DATABASE_URL=f"postgresql://{login}:{password}@{host}:{port}/{postgres_db}"

@pytest.fixture(scope="function")
def test_engine():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_db_session(test_engine):
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(test_db_session):
    def override_get_db():
        try:
            yield test_db_session
        finally:
            test_db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides = {}