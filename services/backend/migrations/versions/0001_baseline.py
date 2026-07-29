"""baseline

Revision ID: 0001
Revises: 
Create Date: 2026-07-29 16:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Initialize PostGIS extension on baseline
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS postgis;")
