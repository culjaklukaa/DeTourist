"""Add trip interests and pacing_tier columns

Revision ID: 7f3a2c8e9b01
Revises: 0d6c1a5fea85
Create Date: 2026-08-18 21:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '7f3a2c8e9b01'
down_revision: Union[str, None] = '0d6c1a5fea85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trips', sa.Column('interests', postgresql.ARRAY(sa.Text()), nullable=True))
    op.add_column('trips', sa.Column('pacing_tier', sa.String(length=20), nullable=True, server_default='moderate'))


def downgrade() -> None:
    op.drop_column('trips', 'pacing_tier')
    op.drop_column('trips', 'interests')
