#!/bin/bash
set -e

echo "🚀 Инициализация Booza Shop..."

# 1. Сборка и запуск контейнеров
echo "📦 Сборка и запуск контейнеров..."
docker compose build
docker compose up -d

# 2. Ожидание готовности БД
echo "⏳ Ожидание готовности PostgreSQL..."
sleep 8

# 3. Запуск Alembic миграций
echo "🔧 Применение миграций Alembic..."
docker compose exec -T backend alembic upgrade head

# 4. Заполнение БД тестовыми данными
echo "📊 Заполнение БД тестовыми данными..."
docker compose exec -T backend python scripts/seed_db.py

# 5. Генерация изображений-заглушек
echo "🎨 Генерация заглушек изображений..."
docker compose exec -T backend python scripts/generate_placeholders.py

echo ""
echo "✅ Инициализация завершена!"
echo "🌐 Backend доступен: http://localhost:8000"
echo "📊 Adminer доступен: http://localhost:8080"
echo ""
echo "📝 Тестовые пользователи:"
echo "   Admin: admin / admin123"
echo "   Waiter: waiter_anna / waiter123"
echo "   Customer: customer1 / user123"
