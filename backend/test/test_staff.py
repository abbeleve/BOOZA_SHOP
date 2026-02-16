import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.models.database import get_db_session
from backend.crud.staff import get_all_staff, get_staff_by_user_id, get_staff_by_username, get_staff_with_details, create_staff, update_staff_role, delete_staff
from backend.models.setting_up_db import Role
from datetime import time

def _create_staff():
    with get_db_session() as db:
        staff = create_staff(
            db=db,
            username="Admin",
            role=Role.ADMIN
        )
        print(staff)

if __name__ == "__main__":
    _create_staff()