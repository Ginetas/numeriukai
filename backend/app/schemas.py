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
    plate: str
    camera_id: Optional[int]
    timestamp: Optional[datetime] = None
    meta: Optional[dict] = None
