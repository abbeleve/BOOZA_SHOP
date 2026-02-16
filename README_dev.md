# 1. Запустите БД (если ещё не запущена)
docker compose up -d db

# 2. Создайте ПЕРВУЮ миграцию (автоматически прочитает setting_up_db.py)
alembic revision --autogenerate -m "initial schema"

# 3. Проверьте, что файл создался
ls alembic/versions/
# Должен быть файл вида: abc123_initial_schema.py

# 4. Откройте его и убедитесь, что в upgrade() есть операции создания таблиц
# Например: op.create_table('users', ...), op.create_table('orders', ...)

# 5. Примените миграцию → ЭТО СОЗДАСТ ВСЕ ТАБЛИЦЫ В БД
alembic upgrade head

# 6. Проверьте результат
alembic current  # Должен показать хеш миграции, не "None"
2. После изменений в моделях

# Создать новую миграцию
alembic revision --autogenerate -m "add email field"

# Проверить файл в alembic/versions/ (ОБЯЗАТЕЛЬНО!)
# Применить изменения
alembic upgrade head