from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CameraCreate(BaseModel):
    name: str
    rtsp_url: str
    zone_id: Optional[int] = None
    fps: Optional[int] = 15
    enabled: bool = True


class CameraUpdate(CameraCreate):
    name: Optional[str] = None
    rtsp_url: Optional[str] = None


class CameraRead(CameraCreate):
    id: int


class ZoneCreate(BaseModel):
    name: str
    type: str = "ENTRY"
    polygon: str


class ZoneUpdate(ZoneCreate):
    name: Optional[str] = None
    type: Optional[str] = None
    polygon: Optional[str] = None


class ZoneRead(ZoneCreate):
    id: int


class ModelConfigCreate(BaseModel):
    name: str
    type: str
    version: Optional[str] = None
    active: bool = True
    config: str


class ModelConfigUpdate(ModelConfigCreate):
    name: Optional[str] = None
    type: Optional[str] = None
    config: Optional[str] = None


class ModelConfigRead(ModelConfigCreate):
    id: int


class SensorCreate(BaseModel):
    name: str
    type: str
    config: str
    camera_id: Optional[int] = None
    zone_id: Optional[int] = None


class SensorUpdate(SensorCreate):
    name: Optional[str] = None
    type: Optional[str] = None
    config: Optional[str] = None


class SensorRead(SensorCreate):
    id: int


class ExporterCreate(BaseModel):
    name: str
    type: str
    endpoint: Optional[str] = None
    config: str
    enabled: bool = True
    last_status: Optional[str] = None


class ExporterUpdate(ExporterCreate):
    name: Optional[str] = None
    type: Optional[str] = None
    config: Optional[str] = None


class ExporterRead(ExporterCreate):
    id: int


class PlateEventIngest(BaseModel):
    plate: str
    camera_id: Optional[int]
    zone_id: Optional[int] = None
    timestamp: Optional[datetime] = None
    meta: Optional[dict] = None


class PlateEventRead(BaseModel):
    id: int
    plate: str
    camera_id: Optional[int]
    zone_id: Optional[int] = None
    timestamp: datetime
    meta: dict
