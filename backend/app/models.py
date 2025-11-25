from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Camera(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    rtsp_url: str
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    fps: Optional[int] = Field(default=15, description="Expected FPS")
    enabled: bool = Field(default=True)


class Zone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = Field(default="ENTRY", description="Zone classification")
    polygon: str


class ModelConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    version: Optional[str] = None
    active: bool = Field(default=True)
    config: str


class Sensor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    config: str
    camera_id: Optional[int] = Field(default=None, foreign_key="camera.id")
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")


class Exporter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    endpoint: Optional[str] = None
    config: str
    enabled: bool = Field(default=True)
    last_status: Optional[str] = None


class PlateEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plate: str
    camera_id: Optional[int] = Field(default=None, foreign_key="camera.id")
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    meta: str = "{}"
