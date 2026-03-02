from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from setting_up_db import Base, Order, OrderItems, MenuItems, FoodType, Users, Staff
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(filename)s:%(lineno)d | %(funcName)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler("debug.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

load_dotenv()

DB_URL = (
        f"postgresql+psycopg2://"
        f"{os.getenv('POSTGRES_USER', 'postgres')}:"
        f"{os.getenv('POSTGRES_PASSWORD', 'postgres')}@"
        f"{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/"
        f"{os.getenv('POSTGRES_DB', 'restaurant')}"
)
logger.info(DB_URL)

def init_database():
    engine = create_engine(
        DB_URL,
        echo=True,
    )

    logger.info("Создание таблиц")
    Base.metadata.create_all(engine)
    logger.info("Таблицы успешно созданы!")

    with engine.connect() as conn:
        logger.info(f"Подключение к БД установлено: {DB_URL}")

    return engine

if __name__ == "__main__":
    try:
        engine = init_database()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    except Exception as e:
        logger.error(f"Ошибка при инициализации БД: {e}")
