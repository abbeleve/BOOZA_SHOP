from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv(".env")

DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
    f"@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}"
    f"/{os.getenv('POSTGRES_DB')}"
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# 1. Все заказы сгруппированные по статусам
print("=" * 60)
print("ВСЕ ЗАКАЗЫ ПО СТАТУСАМ:")
print("=" * 60)
result = session.execute(text("""
    SELECT status, COUNT(*) as count, SUM(total_amount) as total
    FROM orders 
    GROUP BY status
    ORDER BY status
"""))
for row in result:
    status_names = {1: 'ACCEPTED', 2: 'COOKING', 3: 'DELIVERING', 4: 'COMPLETED', 5: 'CANCELLED'}
    status_name = status_names.get(row[0], str(row[0]))
    print(f"Статус {status_name}: {row[1]} заказов, сумма: {row[2]}")

# 2. Заказы за сегодня
print("\n" + "=" * 60)
print("ЗАКАЗЫ ЗА СЕГОДНЯ:")
print("=" * 60)
today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
result = session.execute(text("""
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    FROM orders 
    WHERE create_datetime >= :today
"""), {"today": today})
row = result.fetchone()
print(f"Заказов сегодня: {row[0]}, Сумма: {row[1]}")

# 3. Заказы за месяц
print("\n" + "=" * 60)
print("ЗАКАЗЫ ЗА МЕСЯЦ:")
print("=" * 60)
start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
result = session.execute(text("""
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    FROM orders 
    WHERE create_datetime >= :start
"""), {"start": start_of_month})
row = result.fetchone()
print(f"Заказов за месяц: {row[0]}, Сумма: {row[1]}")

# 4. Заказы за месяц НЕ отменённые
print("\n" + "=" * 60)
print("ЗАКАЗЫ ЗА МЕСЯЦ (НЕ ОТМЕНЁННЫЕ):")
print("=" * 60)
result = session.execute(text("""
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0), AVG(total_amount)
    FROM orders 
    WHERE create_datetime >= :start
    AND status != 'CANCELLED'::status
"""), {"start": start_of_month})
row = result.fetchone()
print(f"Заказов: {row[0]}, Сумма: {row[1]}, Средний чек: {row[2]:.2f}")

# 5. Топ блюд
print("\n" + "=" * 60)
print("ТОП БЛЮД (по количеству):")
print("=" * 60)
result = session.execute(text("""
    SELECT mi.menu_id, mi.food_name, SUM(oi.quantity) as total_qty, COUNT(oi.order_food_id) as orders_count
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.menu_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status != 'CANCELLED'::status
    GROUP BY mi.menu_id, mi.food_name
    ORDER BY total_qty DESC
    LIMIT 10
"""))
for i, row in enumerate(result, 1):
    print(f"{i}. {row[1]} (ID:{row[0]}) - продано: {row[2]} шт. в {row[3]} заказах")

# 6. Динамика по дням
print("\n" + "=" * 60)
print("ДИНАМИКА ПО ДНЯМ (последние 7 дней):")
print("=" * 60)
result = session.execute(text("""
    SELECT DATE(create_datetime), COUNT(*), SUM(total_amount)
    FROM orders
    WHERE create_datetime >= NOW() - INTERVAL '7 days'
    AND status != 'CANCELLED'::status
    GROUP BY DATE(create_datetime)
    ORDER BY DATE(create_datetime)
"""))
for row in result:
    print(f"{row[0]}: {row[1]} заказов, сумма: {row[2]}")

session.close()
