#!/usr/bin/env python3
"""
Скрипт для заполнения БД тестовыми данными.
Запуск через Docker:
  docker-compose exec backend python scripts/seed_db.py
"""

import os
import sys
from dotenv import load_dotenv

# Добавляем backend в path (для запуска из контейнера)
sys.path.insert(0, '/app')

from models.database import get_db_session, engine
from models.setting_up_db import Base, FoodType, MenuItems, Users, Staff, Role, Status, Order
from utils.security import hash_password
from datetime import datetime, time


def seed_food_types(session):
    """Создаёт категории блюд"""
    print("📁 Создание категорий...")
    
    categories = [
        {"category_id": 1, "name": "Пицца"},
        {"category_id": 2, "name": "Суши"},
        {"category_id": 3, "name": "Напитки"},
        {"category_id": 4, "name": "Закуски"},
        {"category_id": 5, "name": "Десерты"},
        {"category_id": 6, "name": "Салаты"},
        {"category_id": 7, "name": "Супы"},
        {"category_id": 8, "name": "Горячее"},
        {"category_id": 9, "name": "Паста"},
        {"category_id": 10, "name": "Бургеры"},
    ]
    
    for cat in categories:
        existing = session.query(FoodType).filter(FoodType.category_id == cat["category_id"]).first()
        if not existing:
            food_type = FoodType(category_id=cat["category_id"], name=cat["name"])
            session.add(food_type)
            print(f"   ✅ Добавлена категория: {cat['name']}")
    
    session.flush()


def seed_menu_items(session):
    """Создаёт элементы меню"""
    print("🍕 Создание меню...")

    menu_items = [
        # ==================== ПИЦЦА (1) ====================
        {"menu_id": 1, "food_name": "Маргарита", "description": "Классическая пицца с томатным соусом и моцареллой", "price": 450, "category_id": 1, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/pizza/margarita.jpg"},
        {"menu_id": 2, "food_name": "Пепперони", "description": "Пицца с пикантной пепперони и сыром моцарелла", "price": 550, "category_id": 1, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pizza/pepperoni.jpg"},
        {"menu_id": 3, "food_name": "Четыре сыра", "description": "Пицца с моцареллой, пармезаном, горгонзолой и чеддером", "price": 650, "category_id": 1, "preparation_time": time(0, 20), "is_available": True, "image_url": "/static/images/pizza/four_cheese.jpg"},
        {"menu_id": 13, "food_name": "Диабло", "description": "Острая пицца с халапеньо и чоризо", "price": 590, "category_id": 1, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pizza/diablo.jpg"},
        {"menu_id": 14, "food_name": "Гавайская", "description": "Пицца с ветчиной и ананасами", "price": 520, "category_id": 1, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pizza/hawaii.jpg"},
        {"menu_id": 15, "food_name": "Мясная", "description": "Пицца с ветчиной, пепперони, колбасками и беконом", "price": 750, "category_id": 1, "preparation_time": time(0, 20), "is_available": True, "image_url": "/static/images/pizza/meat.jpg"},
        {"menu_id": 16, "food_name": "Вегетарианская", "description": "Пицца с грибами, перцем, оливками и томатами", "price": 490, "category_id": 1, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pizza/veggie.jpg"},
        {"menu_id": 17, "food_name": "Карбонара", "description": "Пицца с беконом, сливочным соусом и яйцом", "price": 580, "category_id": 1, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pizza/carbonara.jpg"},
        
        # ==================== СУШИ (2) ====================
        {"menu_id": 4, "food_name": "Филадельфия", "description": "Ролл с лососем, сливочным сыром и огурцом", "price": 520, "category_id": 2, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/sushi/philadelphia.jpg"},
        {"menu_id": 5, "food_name": "Калифорния", "description": "Ролл с крабом, авокадо и икрой тобико", "price": 480, "category_id": 2, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/sushi/california.jpg"},
        {"menu_id": 6, "food_name": "Дракон", "description": "Запеченный ролл с угрем и сливочным сыром", "price": 590, "category_id": 2, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/sushi/dragon.jpg"},
        {"menu_id": 18, "food_name": "Маки с лососем", "description": "Классический ролл с лососем", "price": 320, "category_id": 2, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/sushi/salmon_maki.jpg"},
        {"menu_id": 19, "food_name": "Маки с огурцом", "description": "Классический ролл с огурцом", "price": 250, "category_id": 2, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/sushi/cucumber_maki.jpg"},
        {"menu_id": 20, "food_name": "Темпура ролл", "description": "Запеченный ролл с креветкой в темпуре", "price": 540, "category_id": 2, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/sushi/tempura.jpg"},
        {"menu_id": 21, "food_name": "Сет Филадельфия", "description": "Набор: Филадельфия, Калифорния, Маки (32 шт)", "price": 1490, "category_id": 2, "preparation_time": time(0, 20), "is_available": True, "image_url": "/static/images/sushi/philadelphia_set.jpg"},
        
        # ==================== НАПИТКИ (3) ====================
        {"menu_id": 7, "food_name": "Coca-Cola", "description": "Газированный напиток, 0.5л", "price": 120, "category_id": 3, "preparation_time": time(0, 1), "is_available": True, "image_url": "/static/images/drinks/coca_cola.jpg"},
        {"menu_id": 8, "food_name": "Апельсиновый сок", "description": "Свежевыжатый сок, 0.3л", "price": 250, "category_id": 3, "preparation_time": time(0, 3), "is_available": True, "image_url": "/static/images/drinks/orange_juice.jpg"},
        {"menu_id": 22, "food_name": "Pepsi", "description": "Газированный напиток, 0.5л", "price": 120, "category_id": 3, "preparation_time": time(0, 1), "is_available": True, "image_url": "/static/images/drinks/pepsi.jpg"},
        {"menu_id": 23, "food_name": "Зелёный чай", "description": "Классический зелёный чай, 0.3л", "price": 150, "category_id": 3, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/drinks/green_tea.jpg"},
        {"menu_id": 24, "food_name": "Кофе Латте", "description": "Кофе с молоком, 0.3л", "price": 220, "category_id": 3, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/drinks/latte.jpg"},
        {"menu_id": 25, "food_name": "Лимонад Домашний", "description": "Домашний лимонад, 0.5л", "price": 280, "category_id": 3, "preparation_time": time(0, 3), "is_available": True, "image_url": "/static/images/drinks/lemonade.jpg"},
        
        # ==================== ЗАКУСКИ (4) ====================
        {"menu_id": 9, "food_name": "Картофель фри", "description": "Хрустящий картофель во фритюре", "price": 180, "category_id": 4, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/snacks/fries.jpg"},
        {"menu_id": 10, "food_name": "Луковые кольца", "description": "Жареные луковые кольца в кляре", "price": 200, "category_id": 4, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/snacks/onion_rings.jpg"},
        {"menu_id": 26, "food_name": "Наггетсы", "description": "Куриные наггетсы, 6 шт", "price": 290, "category_id": 4, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/snacks/nuggets.jpg"},
        {"menu_id": 27, "food_name": "Крылышки BBQ", "description": "Куриные крылышки в соусе барбекю", "price": 350, "category_id": 4, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/snacks/wings.jpg"},
        {"menu_id": 28, "food_name": "Сыр моцарелла в панировке", "description": "Запеченная моцарелла в сухарях, 6 шт", "price": 320, "category_id": 4, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/snacks/mozzarella_sticks.jpg"},
        {"menu_id": 29, "food_name": "Гренки чесночные", "description": "Гренки из чёрного хлеба с чесноком", "price": 190, "category_id": 4, "preparation_time": time(0, 8), "is_available": True, "image_url": "/static/images/snacks/croutons.jpg"},
        
        # ==================== ДЕСЕРТЫ (5) ====================
        {"menu_id": 11, "food_name": "Тирамису", "description": "Классический итальянский десерт", "price": 320, "category_id": 5, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/desserts/tiramisu.jpg"},
        {"menu_id": 12, "food_name": "Чизкейк Нью-Йорк", "description": "Классический чизкейк с клубничным соусом", "price": 350, "category_id": 5, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/desserts/cheesecake.jpg"},
        {"menu_id": 30, "food_name": "Панна Котта", "description": "Итальянский десерт с малиновым соусом", "price": 310, "category_id": 5, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/desserts/panna_cotta.jpg"},
        {"menu_id": 31, "food_name": "Брауни", "description": "Шоколадный кекс с шариком мороженого", "price": 290, "category_id": 5, "preparation_time": time(0, 5), "is_available": True, "image_url": "/static/images/desserts/brownie.jpg"},
        {"menu_id": 32, "food_name": "Мороженое", "description": "Шарики мороженого (3 шт), разные вкусы", "price": 250, "category_id": 5, "preparation_time": time(0, 3), "is_available": True, "image_url": "/static/images/desserts/ice_cream.jpg"},
        
        # ==================== САЛАТЫ (6) ====================
        {"menu_id": 33, "food_name": "Цезарь с курицей", "description": "Салат с курицей, пармезаном и сухариками", "price": 420, "category_id": 6, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/salads/caesar_chicken.jpg"},
        {"menu_id": 34, "food_name": "Цезарь с креветками", "description": "Салат с тигровыми креветками", "price": 520, "category_id": 6, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/salads/caesar_shrimp.jpg"},
        {"menu_id": 35, "food_name": "Греческий", "description": "Классический греческий салат с фетой", "price": 380, "category_id": 6, "preparation_time": time(0, 10), "is_available": True, "image_url": "/static/images/salads/greek.jpg"},
        {"menu_id": 36, "food_name": "Капрезе", "description": "Салат с моцареллой, томатами и базиликом", "price": 390, "category_id": 6, "preparation_time": time(0, 8), "is_available": True, "image_url": "/static/images/salads/caprese.jpg"},
        
        # ==================== СУПЫ (7) ====================
        {"menu_id": 37, "food_name": "Борщ", "description": "Классический борщ со сметаной", "price": 320, "category_id": 7, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/soups/borscht.jpg"},
        {"menu_id": 38, "food_name": "Солянка", "description": "Мясная солянка сборная", "price": 380, "category_id": 7, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/soups/solyanka.jpg"},
        {"menu_id": 39, "food_name": "Куриный суп", "description": "Лёгкий куриный суп с лапшой", "price": 280, "category_id": 7, "preparation_time": time(0, 12), "is_available": True, "image_url": "/static/images/soups/chicken_soup.jpg"},
        {"menu_id": 40, "food_name": "Том Ям", "description": "Острый тайский суп с креветками", "price": 450, "category_id": 7, "preparation_time": time(0, 20), "is_available": True, "image_url": "/static/images/soups/tom_yam.jpg"},
        
        # ==================== ГОРЯЧЕЕ (8) ====================
        {"menu_id": 41, "food_name": "Стейк Рибай", "description": "Стейк из мраморной говядины, 300г", "price": 1290, "category_id": 8, "preparation_time": time(0, 25), "is_available": True, "image_url": "/static/images/hot/ribeye.jpg"},
        {"menu_id": 42, "food_name": "Лосось на гриле", "description": "Филе лосося с овощами", "price": 890, "category_id": 8, "preparation_time": time(0, 20), "is_available": True, "image_url": "/static/images/hot/salmon_grill.jpg"},
        {"menu_id": 43, "food_name": "Куриная грудка", "description": "Грудка на гриле с картофельным пюре", "price": 450, "category_id": 8, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/hot/chicken_breast.jpg"},
        {"menu_id": 44, "food_name": "Свиные рёбрышки", "description": "Рёбрышки BBQ с картофелем", "price": 690, "category_id": 8, "preparation_time": time(0, 25), "is_available": True, "image_url": "/static/images/hot/ribs.jpg"},
        
        # ==================== ПАСТА (9) ====================
        {"menu_id": 45, "food_name": "Паста Карбонара", "description": "Классическая карбонара с гуанчиале", "price": 480, "category_id": 9, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/pasta/carbonara_pasta.jpg"},
        {"menu_id": 46, "food_name": "Паста Болоньезе", "description": "Тальятелле с мясным соусом", "price": 450, "category_id": 9, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/pasta/bolognese.jpg"},
        {"menu_id": 47, "food_name": "Паста Альфредо", "description": "Феттучине со сливочным соусом и курицей", "price": 470, "category_id": 9, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/pasta/alfredo.jpg"},
        {"menu_id": 48, "food_name": "Паста с морепродуктами", "description": "Спагетти с миксом морепродуктов", "price": 590, "category_id": 9, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/pasta/seafood_pasta.jpg"},
        
        # ==================== БУРГЕРЫ (10) ====================
        {"menu_id": 49, "food_name": "Чизбургер", "description": "Классический бургер с сыром чеддер", "price": 420, "category_id": 10, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/burgers/cheeseburger.jpg"},
        {"menu_id": 50, "food_name": "Двойной бургер", "description": "Бургер с двумя котлетами", "price": 550, "category_id": 10, "preparation_time": time(0, 18), "is_available": True, "image_url": "/static/images/burgers/double_burger.jpg"},
        {"menu_id": 51, "food_name": "Чикенбургер", "description": "Бургер с куриной котлетой", "price": 390, "category_id": 10, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/burgers/chicken_burger.jpg"},
        {"menu_id": 52, "food_name": "Вегги бургер", "description": "Бургер с овощной котлетой", "price": 380, "category_id": 10, "preparation_time": time(0, 15), "is_available": True, "image_url": "/static/images/burgers/veggie_burger.jpg"},
    ]

    for item in menu_items:
        existing = session.query(MenuItems).filter(MenuItems.menu_id == item["menu_id"]).first()
        if not existing:
            menu_item = MenuItems(
                menu_id=item["menu_id"],
                food_name=item["food_name"],
                description=item["description"],
                price=item["price"],
                category_id=item["category_id"],
                preparation_time=item["preparation_time"],
                is_available=item["is_available"],
                image_url=item["image_url"]
            )
            session.add(menu_item)
            print(f"   ✅ Добавлено: {item['food_name']}")

    session.flush()


def seed_users(session):
    """Создаёт пользователей"""
    print("👥 Создание пользователей...")

    users = [
        # Сотрудники
        {
            "user_id": 1,
            "username": "admin",
            "password": "admin123",
            "name": "Александр",
            "surname": "Иванов",
            "patronymic": "Петрович",
            "email": "admin@booza.ru",
            "phone": "+7 (908) 643-06-88",
            "address": "г. Москва, ул. Ленина, д. 1",
            "is_staff": True,
            "role": "ADMIN"
        },
        {
            "user_id": 2,
            "username": "waiter_anna",
            "password": "waiter123",
            "name": "Анна",
            "surname": "Петрова",
            "patronymic": "Сергеевна",
            "email": "anna@booza.ru",
            "phone": "+7 (909) 123-45-67",
            "address": "г. Москва, ул. Пушкина, д. 10",
            "is_staff": True,
            "role": "STAFF"
        },
        {
            "user_id": 5,
            "username": "chef_mikhail",
            "password": "chef123",
            "name": "Михаил",
            "surname": "Соколов",
            "patronymic": "Андреевич",
            "email": "chef@booza.ru",
            "phone": "+7 (912) 345-67-89",
            "address": "г. Москва, ул. Гагарина, д. 5",
            "is_staff": True,
            "role": "STAFF"
        },
        # Клиенты
        {
            "user_id": 3,
            "username": "customer1",
            "password": "user123",
            "name": "Дмитрий",
            "surname": "Сидоров",
            "patronymic": None,
            "email": "customer1@example.ru",
            "phone": "+7 (910) 555-12-34",
            "address": "г. Москва, ул. Мира, д. 25, кв. 100",
            "is_staff": False,
            "role": None
        },
        {
            "user_id": 4,
            "username": "customer2",
            "password": "user123",
            "name": "Елена",
            "surname": "Козлова",
            "patronymic": "Александровна",
            "email": "customer2@example.ru",
            "phone": "+7 (911) 555-56-78",
            "address": "г. Москва, пр. Победы, д. 50, кв. 25",
            "is_staff": False,
            "role": None
        },
        {
            "user_id": 6,
            "username": "customer3",
            "password": "user123",
            "name": "Сергей",
            "surname": "Морозов",
            "patronymic": "Владимирович",
            "email": "morozov@example.ru",
            "phone": "+7 (913) 777-88-99",
            "address": "г. Москва, ул. Арбат, д. 15, кв. 42",
            "is_staff": False,
            "role": None
        },
        {
            "user_id": 7,
            "username": "customer4",
            "password": "user123",
            "name": "Ольга",
            "surname": "Новикова",
            "patronymic": "Игоревна",
            "email": "olga.n@example.ru",
            "phone": "+7 (914) 222-33-44",
            "address": "г. Москва, ул. Тверская, д. 8, кв. 15",
            "is_staff": False,
            "role": None
        },
        {
            "user_id": 8,
            "username": "customer5",
            "password": "user123",
            "name": "Алексей",
            "surname": "Волков",
            "patronymic": None,
            "email": "volkov@example.ru",
            "phone": "+7 (915) 666-77-88",
            "address": "г. Москва, ул. Садовая, д. 20, кв. 88",
            "is_staff": False,
            "role": None
        },
    ]

    for user_data in users:
        existing = session.query(Users).filter(Users.user_id == user_data["user_id"]).first()
        if not existing:
            user = Users(
                user_id=user_data["user_id"],
                username=user_data["username"],
                hash_password=hash_password(user_data["password"]),
                name=user_data["name"],
                surname=user_data["surname"],
                patronymic=user_data["patronymic"],
                email=user_data["email"],
                phone=user_data["phone"],
                address=user_data["address"],
                create_datetime=datetime.utcnow()
            )
            session.add(user)
            print(f"   ✅ Добавлен пользователь: {user_data['username']}")

            # Если сотрудник, создаём запись Staff
            if user_data["is_staff"]:
                role = Role[user_data["role"]]
                staff = Staff(username=user_data["username"], role=role)
                session.add(staff)
                print(f"      👨‍💼 Сотрудник с ролью: {user_data['role']}")

    session.flush()


def seed_orders(session):
    """Создаёт тестовые заказы"""
    print("📦 Создание заказов...")

    from models.setting_up_db import Order, OrderItems

    orders = [
        # ==================== ЗАКАЗЫ CUSTOMER1 (user_id=3) ====================
        {
            "order_id": 1,
            "user_id": 3,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, ул. Мира, д. 25, кв. 100",
            "total_amount": 1270,
            "description": "Домофон не работает, звонить в дверь",
            "items": [
                {"menu_item_id": 1, "quantity": 2, "price": 450},  # 2x Маргарита
                {"menu_item_id": 7, "quantity": 2, "price": 120},  # 2x Coca-Cola
                {"menu_item_id": 11, "quantity": 1, "price": 320}, # 1x Тирамису
            ]
        },
        {
            "order_id": 3,
            "user_id": 3,
            "status": Status.CANCELLED,
            "delivery_address": "г. Москва, ул. Мира, д. 25, кв. 100",
            "total_amount": 650,
            "description": "Отменил клиент",
            "items": [
                {"menu_item_id": 3, "quantity": 1, "price": 650},  # 1x Четыре сыра
            ]
        },
        {
            "order_id": 7,
            "user_id": 3,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, ул. Мира, д. 25, кв. 100",
            "total_amount": 2180,
            "description": None,
            "items": [
                {"menu_item_id": 41, "quantity": 1, "price": 1290},  # 1x Стейк Рибай
                {"menu_item_id": 23, "quantity": 1, "price": 150},   # 1x Зелёный чай
                {"menu_item_id": 31, "quantity": 1, "price": 290},   # 1x Брауни
                {"menu_item_id": 9, "quantity": 1, "price": 180},    # 1x Картофель фри
                {"menu_item_id": 10, "quantity": 1, "price": 200},   # 1x Луковые кольца
            ]
        },
        {
            "order_id": 10,
            "user_id": 3,
            "status": Status.PENDING,
            "delivery_address": "г. Москва, ул. Мира, д. 25, кв. 100",
            "total_amount": 1490,
            "description": "Позвонить за 30 минут",
            "items": [
                {"menu_item_id": 21, "quantity": 1, "price": 1490},  # 1x Сет Филадельфия
            ]
        },
        
        # ==================== ЗАКАЗЫ CUSTOMER2 (user_id=4) ====================
        {
            "order_id": 2,
            "user_id": 4,
            "status": Status.PENDING,
            "delivery_address": "г. Москва, пр. Победы, д. 50, кв. 25",
            "total_amount": 1590,
            "description": None,
            "items": [
                {"menu_item_id": 4, "quantity": 1, "price": 520},  # 1x Филадельфия
                {"menu_item_id": 5, "quantity": 1, "price": 480},  # 1x Калифорния
                {"menu_item_id": 6, "quantity": 1, "price": 590},  # 1x Дракон
            ]
        },
        {
            "order_id": 5,
            "user_id": 4,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, пр. Победы, д. 50, кв. 25",
            "total_amount": 1140,
            "description": "Курьеру: подниматься на 25 этаж",
            "items": [
                {"menu_item_id": 49, "quantity": 2, "price": 420},  # 2x Чизбургер
                {"menu_item_id": 22, "quantity": 1, "price": 120},  # 1x Pepsi
                {"menu_item_id": 9, "quantity": 1, "price": 180},   # 1x Картофель фри
            ]
        },
        {
            "order_id": 8,
            "user_id": 4,
            "status": Status.CANCELLED,
            "delivery_address": "г. Москва, пр. Победы, д. 50, кв. 25",
            "total_amount": 890,
            "description": "Передумал",
            "items": [
                {"menu_item_id": 42, "quantity": 1, "price": 890},  # 1x Лосось на гриле
            ]
        },
        
        # ==================== ЗАКАЗЫ CUSTOMER3 (user_id=6) ====================
        {
            "order_id": 4,
            "user_id": 6,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, ул. Арбат, д. 15, кв. 42",
            "total_amount": 1850,
            "description": "Оставить у двери",
            "items": [
                {"menu_item_id": 15, "quantity": 1, "price": 750},  # 1x Мясная пицца
                {"menu_item_id": 16, "quantity": 1, "price": 490},  # 1x Вегетарианская
                {"menu_item_id": 25, "quantity": 1, "price": 280},  # 1x Лимонад
                {"menu_item_id": 32, "quantity": 1, "price": 250},  # 1x Мороженое
            ]
        },
        {
            "order_id": 9,
            "user_id": 6,
            "status": Status.PENDING,
            "delivery_address": "г. Москва, ул. Арбат, д. 15, кв. 42",
            "total_amount": 1570,
            "description": None,
            "items": [
                {"menu_item_id": 45, "quantity": 2, "price": 480},  # 2x Паста Карбонара
                {"menu_item_id": 36, "quantity": 1, "price": 390},  # 1x Капрезе
                {"menu_item_id": 24, "quantity": 1, "price": 220},  # 1x Кофе Латте
            ]
        },
        
        # ==================== ЗАКАЗЫ CUSTOMER4 (user_id=7) ====================
        {
            "order_id": 6,
            "user_id": 7,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, ул. Тверская, д. 8, кв. 15",
            "total_amount": 2340,
            "description": "Аллергия на орехи!",
            "items": [
                {"menu_item_id": 47, "quantity": 1, "price": 470},  # 1x Паста Альфредо
                {"menu_item_id": 34, "quantity": 1, "price": 520},  # 1x Цезарь с креветками
                {"menu_item_id": 40, "quantity": 1, "price": 450},  # 1x Том Ям
                {"menu_item_id": 30, "quantity": 1, "price": 310},  # 1x Панна Котта
                {"menu_item_id": 8, "quantity": 1, "price": 250},   # 1x Апельсиновый сок
                {"menu_item_id": 29, "quantity": 1, "price": 190},  # 1x Гренки
            ]
        },
        {
            "order_id": 11,
            "user_id": 7,
            "status": Status.PENDING,
            "delivery_address": "г. Москва, ул. Тверская, д. 8, кв. 15",
            "total_amount": 3030,
            "description": "Нужно к 19:00",
            "items": [
                {"menu_item_id": 50, "quantity": 2, "price": 550},  # 2x Двойной бургер
                {"menu_item_id": 27, "quantity": 1, "price": 350},  # 1x Крылышки BBQ
                {"menu_item_id": 10, "quantity": 1, "price": 200},  # 1x Луковые кольца
                {"menu_item_id": 25, "quantity": 2, "price": 280},  # 2x Лимонад
                {"menu_item_id": 12, "quantity": 1, "price": 350},  # 1x Чизкейк
            ]
        },
        
        # ==================== ЗАКАЗЫ CUSTOMER5 (user_id=8) ====================
        {
            "order_id": 12,
            "user_id": 8,
            "status": Status.COMPLETED,
            "delivery_address": "г. Москва, ул. Садовая, д. 20, кв. 88",
            "total_amount": 1780,
            "description": "Код домофона: 1234#",
            "items": [
                {"menu_item_id": 2, "quantity": 1, "price": 550},  # 1x Пепперони
                {"menu_item_id": 17, "quantity": 1, "price": 580},  # 1x Карбонара пицца
                {"menu_item_id": 33, "quantity": 1, "price": 420},  # 1x Цезарь с курицей
                {"menu_item_id": 7, "quantity": 1, "price": 120},   # 1x Coca-Cola
            ]
        },
        {
            "order_id": 13,
            "user_id": 8,
            "status": Status.PENDING,
            "delivery_address": "г. Москва, ул. Садовая, д. 20, кв. 88",
            "total_amount": 2470,
            "description": None,
            "items": [
                {"menu_item_id": 44, "quantity": 1, "price": 690},  # 1x Свиные рёбрышки
                {"menu_item_id": 38, "quantity": 1, "price": 380},  # 1x Солянка
                {"menu_item_id": 20, "quantity": 1, "price": 540},  # 1x Темпура ролл
                {"menu_item_id": 19, "quantity": 1, "price": 250},  # 1x Маки с огурцом
                {"menu_item_id": 23, "quantity": 1, "price": 150},  # 1x Зелёный чай
                {"menu_item_id": 31, "quantity": 1, "price": 290},  # 1x Брауни
            ]
        },
        {
            "order_id": 14,
            "user_id": 8,
            "status": Status.CANCELLED,
            "delivery_address": "г. Москва, ул. Садовая, д. 20, кв. 88",
            "total_amount": 1290,
            "description": "Отменил оператор",
            "items": [
                {"menu_item_id": 41, "quantity": 1, "price": 1290},  # 1x Стейк Рибай
            ]
        },
    ]

    for order_data in orders:
        existing = session.query(Order).filter(Order.order_id == order_data["order_id"]).first()
        if not existing:
            order = Order(
                order_id=order_data["order_id"],
                user_id=order_data["user_id"],
                status=order_data["status"],
                delivery_address=order_data["delivery_address"],
                total_amount=order_data["total_amount"],
                description=order_data["description"],
                create_datetime=datetime.utcnow(),
                end_datetime=datetime.utcnow() if order_data["status"] != Status.PENDING else None
            )
            session.add(order)
            session.flush()  # Получаем order_id

            # Добавляем элементы заказа
            for item_data in order_data["items"]:
                order_item = OrderItems(
                    order_id=order.order_id,
                    menu_item_id=item_data["menu_item_id"],
                    quantity=item_data["quantity"],
                    price=item_data["price"]
                )
                session.add(order_item)

            print(f"   ✅ Добавлен заказ #{order_data['order_id']} ({order_data['status'].name})")

    session.flush()


def main():
    load_dotenv()
    
    print("=" * 50)
    print("🌱 Seed DB - Заполнение базы данных")
    print("=" * 50)
    
    try:
        with get_db_session() as session:
            seed_food_types(session)
            seed_menu_items(session)
            seed_users(session)
            seed_orders(session)
            
            session.commit()
            
            print("\n" + "=" * 50)
            print("✅ База данных успешно заполнена!")
            print("=" * 50)
            
            # Вывод статистики
            print("\n📊 Статистика:")
            print(f"   Категорий: {session.query(FoodType).count()}")
            print(f"   Блюд в меню: {session.query(MenuItems).count()}")
            print(f"   Пользователей: {session.query(Users).count()}")
            print(f"   Сотрудников: {session.query(Staff).count()}")
            print(f"   Заказов: {session.query(Order).count()}")
            
            print("\n🔐 Тестовые учётные данные:")
            print("   👨‍💼 Admin: admin / admin123")
            print("   👨‍💼 Waiter: waiter_anna / waiter123")
            print("   👨‍💼 Chef: chef_mikhail / chef123")
            print("   👤 Customer 1: customer1 / user123")
            print("   👤 Customer 2: customer2 / user123")
            print("   👤 Customer 3: customer3 / user123")
            print("   👤 Customer 4: customer4 / user123")
            print("   👤 Customer 5: customer5 / user123")
            
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        raise


if __name__ == '__main__':
    main()
