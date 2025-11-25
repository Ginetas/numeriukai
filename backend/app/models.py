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
    geometry: str


class ModelConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    config: str


class OCRModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    weight: float = 1.0
    enabled: bool = True
    priority: int = 0
    params: str = "{}"


class OCREnsembleConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    enabled_models: str
    weights: str
    method: str = "majority"
    beam_width: int = 2


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
    bbox: str = "{}"
    full_frame_url: Optional[str] = None
    crop_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    meta: str = "{}"
