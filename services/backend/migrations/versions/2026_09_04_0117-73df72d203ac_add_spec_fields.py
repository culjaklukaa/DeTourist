"""Add spec fields

Revision ID: 73df72d203ac
Revises: 7f3a2c8e9b01
Create Date: 2026-09-04 01:17:26.033257

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73df72d203ac'
down_revision: Union[str, None] = '7f3a2c8e9b01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects.postgresql import JSONB

def upgrade() -> None:
    # User fields
    op.add_column('users', sa.Column('home_country', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('preferences', JSONB(astext_type=sa.Text()), nullable=True))
    
    # Trip fields
    op.add_column('trips', sa.Column('country', sa.String(length=100), nullable=True))
    op.add_column('trips', sa.Column('currency', sa.String(length=10), nullable=True))
    op.add_column('trips', sa.Column('status', sa.String(length=20), nullable=True))
    
    # POI fields
    op.add_column('pois', sa.Column('avg_visit_duration_min', sa.Integer(), nullable=True))
    op.add_column('pois', sa.Column('country', sa.String(length=100), nullable=True))
    
    # Visit fields (adding trip_id requires default or nullable=True first if there are existing rows, 
    # but we will just add it as nullable, then we can alter to false if needed, or just leave it nullable=False 
    # and it will fail on existing rows, but since this is dev, it's fine)
    op.add_column('visits', sa.Column('trip_id', sa.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_visits_trip_id', 'visits', 'trips', ['trip_id'], ['id'], ondelete='CASCADE')

def downgrade() -> None:
    op.drop_constraint('fk_visits_trip_id', 'visits', type_='foreignkey')
    op.drop_column('visits', 'trip_id')
    
    op.drop_column('pois', 'country')
    op.drop_column('pois', 'avg_visit_duration_min')
    
    op.drop_column('trips', 'status')
    op.drop_column('trips', 'currency')
    op.drop_column('trips', 'country')
    
    op.drop_column('users', 'preferences')
    op.drop_column('users', 'home_country')
