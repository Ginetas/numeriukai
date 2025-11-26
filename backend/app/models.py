from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class Camera(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    rtsp_url: str
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    fps: Optional[int] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    enabled: bool = True
    notes: Optional[str] = None


class Zone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    geometry: dict = Field(sa_column=Column(JSON))
    type: Optional[str] = None
    color: Optional[str] = None


class ModelConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    name: str
    version: Optional[str] = None
    weights_path: Optional[str] = None
    params: Optional[dict] = Field(default=None, sa_column=Column(JSON))


class Sensor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    name: str
    config: dict = Field(sa_column=Column(JSON))
    camera_id: Optional[int] = Field(default=None, foreign_key="camera.id")
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")


class Exporter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    name: str
    endpoint: str
    auth: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    retry_config: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    enabled: bool = True


class PlateEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plate_text: str
    confidence: Optional[float] = None
    camera_id: Optional[int] = Field(default=None, foreign_key="camera.id")
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    direction: Optional[str] = None
    frame_url: Optional[str] = None
    crop_url: Optional[str] = None
    sensor_snapshot: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    raw_payload: Optional[dict] = Field(default=None, sa_column=Column(JSON))
