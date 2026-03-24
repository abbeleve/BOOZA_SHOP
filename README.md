# 🍽️ RMS — Restaurant Management System

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24%2B-2496ED?logo=docker)](https://www.docker.com/)

**Система управления рестораном или позной с клиентским интерфейсом заказа и админкой для меню, заказов и персонала**
</div>

---

## 🚀 Основные возможности

### Для гостей:
- Просмотр меню с категориями и изображениями  
- Онлайн-заказ блюд через веб-интерфейс  
- Отслеживание статуса заказа в реальном времени  
- История заказов  

### Для ресторана:
- Управление меню: добавление, редактирование, удаление блюд  
- Приём и обработка заказов  
- Назначение ролей сотрудникам (официант, повар, администратор)  
- Аналитика и отчёты по продажам  

---

## 🛠️ Технологии

- **Backend**: Python, FastAPI, SQLAlchemy, Alembic  
- **Frontend**: React (TypeScript)  
- **База данных**: PostgreSQL  
- **Инфраструктура**: Docker, Docker Compose  

---

## 📦 Быстрый запуск

*Если не проделывали установку перейдите в раздел Установка*

Для запуска необходимо корневой папке прописать команду

```bash
docker compose up
```

## Для запуска необходимо иметь установленный Docker + WSL2/Linux

https://docs.docker.com/desktop/features/wsl/


## Установка

1. Склонировать репозиторий на локальный ПК

```bash
git clone https://github.com/abbeleve/BOOZA_SHOP.git
```

2. Скопировать пересланный вам по ТГ файл .env в корень папки проекта

3. Выполнять дальнейшие инструкции по развертыванию

### Вариант 1: Автоматическая инициализация (рекомендуется)

```bash
# Один шаг - сборка, запуск, миграции, заполнение БД, генерация изображений
./scripts/init.sh
```

Или через Make:

```bash
make init
```

### Вариант 2: Ручной запуск по шагам (не использовать)

```bash
# 1. Сборка и запуск
docker compose build
docker compose up -d

# 2. Миграции
docker compose exec backend alembic upgrade head

# 3. Заполнение БД
docker compose exec backend python scripts/seed_db.py

# 4. Генерация заглушек изображений
docker compose exec backend python scripts/generate_placeholders.py
```

### Команды управления (Make)

```bash
make init       # Полная инициализация
make up         # Запуск контейнеров
make down       # Остановка
make logs       # Просмотр логов
make migrate    # Применение миграций
make seed       # Заполнение БД
make generate   # Генерация изображений
make clean      # Полная очистка и пересборка
```

---

## 📕 Вход в систему
Система будет доступна по адресу http://localhost:5173/

Креды для входа:
- **Админ**:
login: admin | password: admin123
- **Сотрудник**:
- login: waiter_anna | password: waiter123
- **Клиент**:
- login: customer1 | password: user123

Функционал клиента:
1. Производить заказы
2. Просматривать каталоги еды
3. Просматривать статусы заказа

Функционал сотрудника:
1. Просматривать заказы
2. Просматривать статусы заказа
3. Изменять статусы закзаа

Функционал администратора
1. Просматривать заказы
2. Просматривать статусы заказа
3. Контроль над учетными записями сотрудников
