import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.models.database import get_db_session
from backend.crud.food_type import create_food_category, get_food_categories, get_food_category_by_name, get_food_category, update_food_category, delete_food_category
from datetime import time   

def test_create_food_type():
    with get_db_session() as db:
        food_category = create_food_category(
            db=db,
            category_id=1,
            name="Фастфуд"
        )
        print(food_category)

if __name__ == "__main__":
    test_create_food_type()