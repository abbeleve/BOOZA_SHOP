"""update_order_status_enum

Revision ID: 52f3ff180f2a
Revises: 40f18554bb8a
Create Date: 2026-03-16 20:26:25.229675

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '52f3ff180f2a'
down_revision: Union[str, Sequence[str], None] = '40f18554bb8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Обновляем enum Status: добавляем новые значения и меняем PENDING на ACCEPTED
    # Для PostgreSQL:
    # 1. Добавляем новые значения в enum
    # 2. Обновляем существующие записи PENDING -> ACCEPTED
    
    # Добавляем новые значения в enum
    op.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'ACCEPTED'")
    op.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'COOKING'")
    op.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'DELIVERING'")
    op.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'COMPLETED'")
    op.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'CANCELLED'")
    

def downgrade() -> None:
    """Downgrade schema."""
    # Возвращаем ACCEPTED -> PENDING
    op.execute("UPDATE orders SET status = 'PENDING' WHERE status = 'ACCEPTED'")
