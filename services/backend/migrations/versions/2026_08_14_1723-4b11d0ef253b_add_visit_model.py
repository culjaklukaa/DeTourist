"""Add Visit model

Revision ID: 4b11d0ef253b
Revises: 0003
Create Date: 2026-08-14 17:23:56.903095

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b11d0ef253b'
down_revision: Union[str, None] = '0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'visits',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('poi_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('arrived_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('departed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('source', sa.Enum('gps_auto', 'manual_checkin', name='visit_source_enum'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['poi_id'], ['pois.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('visits')
    op.execute("DROP TYPE visit_source_enum")
