# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.endpoints import auth
from backend.models.database import engine

app = FastAPI(title="BOOZA_SHOP API", version="1.0.0")

# Роутеры
app.include_router(auth.router)

@app.get("/")
async def root():
    return {
        "app": "BOOZA_SHOP API",
        "docs": "/docs",
        "redoc": "/redoc"
    }