# backend/Dockerfile
FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости из КОРНЯ проекта
COPY requirements.txt ./

RUN pip install --upgrade pip
# Устанавливаем ВСЁ из uv.lock (включая alembic, ruff — как в pyproject.toml)
RUN pip install -r requirements.txt

# Копируем ТОЛЬКО код бэкенда
COPY . .

RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Запуск приложения (переопределяется в docker-compose.yml)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]