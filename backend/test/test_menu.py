import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.models.database import get_db_session
from backend.crud.menu import create_menu_item, update_menu_item, delete_menu_item, get_menu_item, get_menu_items
from datetime import time

def add_menu_item():
    with get_db_session() as db:
        menu_item = create_menu_item(
            db=db,
            food_name="Чизбургер",
            price=150,
            category_id=1,
            description="Вкуснеший чизбургер",
            image_url=None,
            is_available=True,
            preparation_time=time(0, 5, 0))
        print(menu_item)

if __name__ == "__main__":
    add_menu_item()