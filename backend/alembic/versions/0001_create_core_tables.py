"""create core tables

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'zone',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('polygon', sa.String(), nullable=False),
    )
    op.create_table(
        'camera',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('rtsp_url', sa.String(), nullable=False),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('zone.id'), nullable=True),
    )
    op.create_table(
        'modelconfig',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('config', sa.String(), nullable=False),
    )
    op.create_table(
        'sensor',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('config', sa.String(), nullable=False),
    )
    op.create_table(
        'exporter',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('config', sa.String(), nullable=False),
    )
    op.create_table(
        'plateevent',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('plate', sa.String(), nullable=False),
        sa.Column('camera_id', sa.Integer(), sa.ForeignKey('camera.id'), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=False), nullable=False),
        sa.Column('meta', sa.String(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('plateevent')
    op.drop_table('exporter')
    op.drop_table('sensor')
    op.drop_table('modelconfig')
    op.drop_table('camera')
    op.drop_table('zone')
