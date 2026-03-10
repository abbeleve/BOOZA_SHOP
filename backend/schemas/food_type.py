from pydantic import BaseModel
from typing import Optional


class FoodTypeResponse(BaseModel):
    category_id: int
    name: str

    class Config:
        orm_mode = True
