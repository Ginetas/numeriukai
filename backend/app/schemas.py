from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ORMBase(BaseModel):
    class Config:
        from_attributes = True


class CameraBase(BaseModel):
    name: str
    rtsp_url: str
    zone_id: Optional[int] = None
    fps: Optional[int] = None
    resolution_width: Optional[int] = Field(default=None, ge=1)
    resolution_height: Optional[int] = Field(default=None, ge=1)
    enabled: bool = True
    notes: Optional[str] = None


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase, ORMBase):
    id: int


class ZoneBase(BaseModel):
    name: str
    geometry: dict
    type: Optional[str] = None
    color: Optional[str] = None


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    geometry: Optional[dict] = None
    type: Optional[str] = None
    color: Optional[str] = None


class ZoneRead(ZoneBase, ORMBase):
    id: int


class ModelConfigBase(BaseModel):
    type: str
    name: str
    version: Optional[str] = None
    weights_path: Optional[str] = None
    params: Optional[dict] = None


class ModelConfigCreate(ModelConfigBase):
    pass


class ModelConfigRead(ModelConfigBase, ORMBase):
    id: int


class SensorBase(BaseModel):
    type: str
    name: str
    config: dict
    camera_id: Optional[int] = None
    zone_id: Optional[int] = None


class SensorCreate(SensorBase):
    pass


class SensorRead(SensorBase, ORMBase):
    id: int


class ExporterBase(BaseModel):
    type: str
    name: str
    endpoint: str
    auth: Optional[dict] = None
    retry_config: Optional[dict] = None
    enabled: bool = True


class ExporterCreate(ExporterBase):
    pass


class ExporterRead(ExporterBase, ORMBase):
    id: int


class PlateEventBase(BaseModel):
    plate_text: str
    confidence: Optional[float] = None
    camera_id: Optional[int] = None
    zone_id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    direction: Optional[str] = None
    frame_url: Optional[str] = None
    crop_url: Optional[str] = None
    sensor_snapshot: Optional[dict] = None
    raw_payload: Optional[dict] = None


class PlateEventCreate(PlateEventBase):
    pass


class PlateEventRead(PlateEventBase, ORMBase):
    id: int
