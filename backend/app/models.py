from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Camera(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    rtsp_url: str
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")


class Zone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = "Entry"
    geometry: str


class ModelConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    config: str


class Sensor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    config: str


class Exporter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    config: str


class PlateEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plate_text: str
    confidence: float = 0.0
    camera_id: Optional[int] = Field(default=None, foreign_key="camera.id")
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    direction: Optional[str] = None
    frame_url: Optional[str] = None
    crop_url: Optional[str] = None
    bbox: Optional[str] = None
    track_id: Optional[int] = None
    sensor_snapshot: Optional[str] = None
