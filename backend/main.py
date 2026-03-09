# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import auth, staff, menu, food_type, order
from models.database import engine

app = FastAPI(title="BOOZA_SHOP API", version="1.0.0")

# Роутеры
app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(menu.router)
app.include_router(food_type.router)
app.include_router(order.router)

@app.get("/")
async def root():
    return {
        "app": "BOOZA_SHOP API",
        "docs": "/docs",
        "redoc": "/redoc"
    }