"""expand schema with richer configuration and plate events

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-02 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("camera", sa.Column("fps", sa.Integer(), nullable=True))
    op.add_column("camera", sa.Column("resolution_width", sa.Integer(), nullable=True))
    op.add_column("camera", sa.Column("resolution_height", sa.Integer(), nullable=True))
    op.add_column("camera", sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("camera", sa.Column("notes", sa.String(), nullable=True))

    op.add_column("zone", sa.Column("geometry", postgresql.JSON(astext_type=sa.Text()), nullable=False))
    op.add_column("zone", sa.Column("color", sa.String(), nullable=True))
    op.alter_column("zone", "type", existing_type=sa.String(), nullable=True, server_default=None)

    op.add_column("modelconfig", sa.Column("version", sa.String(), nullable=True))
    op.add_column("modelconfig", sa.Column("weights_path", sa.String(), nullable=True))
    op.add_column("modelconfig", sa.Column("params", postgresql.JSON(astext_type=sa.Text()), nullable=True))

    op.add_column("sensor", sa.Column("camera_id", sa.Integer(), nullable=True))
    op.add_column("sensor", sa.Column("zone_id", sa.Integer(), nullable=True))
    op.alter_column("sensor", "config", type_=postgresql.JSON(astext_type=sa.Text()), nullable=False)
    op.create_foreign_key(None, "sensor", "camera", ["camera_id"], ["id"], ondelete=None)
    op.create_foreign_key(None, "sensor", "zone", ["zone_id"], ["id"], ondelete=None)

    op.alter_column("exporter", "config", new_column_name="retry_config", type_=postgresql.JSON(astext_type=sa.Text()), nullable=True)
    op.add_column("exporter", sa.Column("endpoint", sa.String(), nullable=False, server_default=""))
    op.add_column("exporter", sa.Column("auth", postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column("exporter", sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()))

    op.alter_column("plateevent", "plate", new_column_name="plate_text")
    op.add_column("plateevent", sa.Column("confidence", sa.Float(), nullable=True))
    op.add_column("plateevent", sa.Column("zone_id", sa.Integer(), nullable=True))
    op.add_column("plateevent", sa.Column("direction", sa.String(), nullable=True))
    op.add_column("plateevent", sa.Column("frame_url", sa.String(), nullable=True))
    op.add_column("plateevent", sa.Column("crop_url", sa.String(), nullable=True))
    op.add_column("plateevent", sa.Column("sensor_snapshot", postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column("plateevent", sa.Column("raw_payload", postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.create_foreign_key(None, "plateevent", "zone", ["zone_id"], ["id"], ondelete=None)


def downgrade() -> None:
    op.drop_constraint(None, "plateevent", type_="foreignkey")
    op.drop_column("plateevent", "raw_payload")
    op.drop_column("plateevent", "sensor_snapshot")
    op.drop_column("plateevent", "crop_url")
    op.drop_column("plateevent", "frame_url")
    op.drop_column("plateevent", "direction")
    op.drop_column("plateevent", "zone_id")
    op.drop_column("plateevent", "confidence")
    op.alter_column("plateevent", "plate_text", new_column_name="plate")

    op.drop_column("exporter", "enabled")
    op.drop_column("exporter", "auth")
    op.drop_column("exporter", "endpoint")
    op.alter_column("exporter", "retry_config", new_column_name="config", type_=sa.String(), nullable=False)

    op.drop_constraint(None, "sensor", type_="foreignkey")
    op.drop_constraint(None, "sensor", type_="foreignkey")
    op.drop_column("sensor", "zone_id")
    op.drop_column("sensor", "camera_id")
    op.alter_column("sensor", "config", type_=sa.String(), nullable=False)

    op.drop_column("modelconfig", "params")
    op.drop_column("modelconfig", "weights_path")
    op.drop_column("modelconfig", "version")

    op.alter_column("zone", "type", existing_type=sa.String(), nullable=False, server_default="Entry")
    op.drop_column("zone", "color")
    op.drop_column("zone", "geometry")

    op.drop_column("camera", "notes")
    op.drop_column("camera", "enabled")
    op.drop_column("camera", "resolution_height")
    op.drop_column("camera", "resolution_width")
    op.drop_column("camera", "fps")
