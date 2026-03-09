# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import auth, staff, menu
from models.database import engine

app = FastAPI(title="BOOZA_SHOP API", 
              version="1.0.0")

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры
app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(menu.router)

@app.get("/")
async def root():
    return {
        "app": "BOOZA_SHOP API",
        "docs": "/docs",
        "redoc": "/redoc"
    }