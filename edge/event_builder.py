from __future__ import annotations

import cv2
from datetime import datetime
from typing import Optional

import numpy as np
from pydantic import BaseModel

from detector import Detection
from tracker import Track
from ocr.base import OcrResult


class PlateEvent(BaseModel):
    plate_text: str
    confidence: float
    camera_id: str | int
    timestamp: datetime
    track_id: Optional[int]
    frame_jpeg: bytes
    crop_jpeg: bytes
    bbox: tuple[float, float, float, float]
    extra: dict | None = None


class EventBuilder:
    def __init__(self, camera_id: str | int) -> None:
        self.camera_id = camera_id

    def _encode_jpeg(self, image: np.ndarray) -> bytes:
        success, buffer = cv2.imencode(".jpg", image)
        if not success:
            raise ValueError("Failed to encode image to JPEG")
        return buffer.tobytes()

    def build(self, frame: np.ndarray, track: Track, detection: Detection, ocr_result: OcrResult) -> PlateEvent:
        x1, y1, x2, y2 = map(int, detection.bbox)
        crop = frame[max(0, y1) : max(0, y2), max(0, x1) : max(0, x2)]
        return PlateEvent(
            plate_text=ocr_result.text,
            confidence=ocr_result.confidence,
            camera_id=self.camera_id,
            timestamp=datetime.utcnow(),
            track_id=track.track_id,
            frame_jpeg=self._encode_jpeg(frame),
            crop_jpeg=self._encode_jpeg(crop),
            bbox=detection.bbox,
            extra={"hits": track.hits},
        )
