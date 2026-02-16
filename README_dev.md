1. Применяй миграцию с хоста при перезапуске 
docker compose up
alembic upgrade head

2. После изменений в моделях

# Создать новую миграцию
alembic revision --autogenerate -m "add email field"

# Проверить файл в alembic/versions/ (ОБЯЗАТЕЛЬНО!)
# Применить изменения
alembic upgrade head