"""Add Route model

Revision ID: 0d6c1a5fea85
Revises: a6d6851f1e21
Create Date: 2026-08-14 18:01:53.038550

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d6c1a5fea85'
down_revision: Union[str, None] = 'a6d6851f1e21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'routes',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('trip_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('poi_sequence', sa.ARRAY(sa.UUID(as_uuid=True)), nullable=False),
        sa.Column('total_score', sa.Float(), nullable=False),
        sa.Column('mode', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('routes')
