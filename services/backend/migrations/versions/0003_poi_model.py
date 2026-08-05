"""POI model

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-02 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM type for source
    source_enum = postgresql.ENUM('osm', 'partner', 'manual', name='poi_source_enum')
    source_enum.create(op.get_bind())

    # Create POI table
    op.create_table('pois',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('source', source_enum, nullable=False, server_default='osm'),
        sa.Column('significance_tier', sa.Integer(), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pois_category'), 'pois', ['category'], unique=False)
    op.create_index(op.f('ix_pois_name'), 'pois', ['name'], unique=False)
    op.create_index('idx_pois_location', 'pois', ['location'], unique=False, postgresql_using='gist')


def downgrade() -> None:
    op.drop_index('idx_pois_location', table_name='pois', postgresql_using='gist')
    op.drop_index(op.f('ix_pois_name'), table_name='pois')
    op.drop_index(op.f('ix_pois_category'), table_name='pois')
    op.drop_table('pois')
    
    source_enum = postgresql.ENUM('osm', 'partner', 'manual', name='poi_source_enum')
    source_enum.drop(op.get_bind())
