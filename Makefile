.PHONY: init build up down logs restart migrate seed generate clean

# Инициализация проекта (полный пайплайн)
init:
	@echo "🚀 Инициализация Booza Shop..."
	@./scripts/init.sh

# Сборка контейнеров
build:
	docker compose build

# Запуск контейнеров
up:
	docker compose up -d

# Остановка контейнеров
down:
	docker compose down

# Логи
logs:
	docker compose logs -f backend

# Перезапуск
restart:
	docker compose restart

# Применение миграций
migrate:
	docker compose exec -T backend alembic upgrade head

# Заполнение БД тестовыми данными
seed:
	docker compose exec -T backend python scripts/seed_db.py

# Генерация заглушек изображений
generate:
	docker compose exec -T backend python scripts/generate_placeholders.py

# Очистка (пересоздание БД)
clean:
	docker compose down -v
	docker compose build

# Помощь
help:
	@echo "📋 Доступные команды:"
	@echo "  make init       - Полная инициализация (build + up + migrate + seed + generate)"
	@echo "  make build      - Сборка контейнеров"
	@echo "  make up         - Запуск контейнеров"
	@echo "  make down       - Остановка контейнеров"
	@echo "  make logs       - Просмотр логов"
	@echo "  make restart    - Перезапуск"
	@echo "  make migrate    - Применение миграций Alembic"
	@echo "  make seed       - Заполнение БД тестовыми данными"
	@echo "  make generate   - Генерация заглушек изображений"
	@echo "  make clean      - Полная очистка (удаление volumes и пересборка)"
