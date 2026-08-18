"""Add CrowdSignal model

Revision ID: a6d6851f1e21
Revises: 4b11d0ef253b
Create Date: 2026-08-14 17:38:05.983663

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a6d6851f1e21'
down_revision: Union[str, None] = '4b11d0ef253b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'crowd_signals',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('poi_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('time_bucket', sa.DateTime(timezone=True), nullable=False),
        sa.Column('crowd_index', sa.Float(), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['poi_id'], ['pois.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crowd_signals_time_bucket'), 'crowd_signals', ['time_bucket'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_crowd_signals_time_bucket'), table_name='crowd_signals')
    op.drop_table('crowd_signals')
