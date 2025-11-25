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
    geometry: str


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


class OCRModelCreate(BaseModel):
    name: str
    type: str
    weight: float = 1.0
    enabled: bool = True
    priority: int = 0
    params: dict = {}


class OCREnsembleUpdate(BaseModel):
    enabled_models: list[str]
    weights: dict
    method: str = "majority"
    beam_width: int = 2
