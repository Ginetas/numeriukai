from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CameraCreate(BaseModel):
    name: str
    rtsp_url: str
    zone_id: Optional[int] = None


class ZoneCreate(BaseModel):
    name: str
    type: str
    geometry: str


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    geometry: Optional[str] = None


class ModelConfigCreate(BaseModel):
    name: str
    type: str
    config: str


class SensorCreate(BaseModel):
    name: str
    type: str
    config: str


class ExporterCreate(BaseModel):
    name: str
    type: str
    config: str


class PlateEventIngest(BaseModel):
    plate_text: str
    confidence: float
    camera_id: Optional[int]
    zone_id: Optional[int] = None
    timestamp: Optional[datetime] = None
    direction: Optional[str] = None
    frame_jpeg: Optional[str] = None
    crop_jpeg: Optional[str] = None
    bbox: Optional[list[float]] = None
    track_id: Optional[int] = None
    sensor_snapshot: Optional[dict] = None
