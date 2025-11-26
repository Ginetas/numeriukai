from __future__ import annotations

import base64
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, WebSocket
from sqlmodel import Session

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/events", tags=["events"])


MEDIA_ROOT = Path("media/events")


def _save_image(content_b64: Optional[str], suffix: str, event_id: int) -> Optional[str]:
    if not content_b64:
        return None
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    path = MEDIA_ROOT / f"{event_id}_{suffix}.jpg"
    path.write_bytes(base64.b64decode(content_b64))
    return f"/media/events/{path.name}"


@router.post("/ingest")
def ingest_event(payload: schemas.PlateEventIngest, session: Session = Depends(get_session)) -> dict:
    if not payload.plate_text:
        raise ValueError("plate_text is required")
    event = models.PlateEvent(
        plate_text=payload.plate_text,
        confidence=payload.confidence,
        camera_id=payload.camera_id,
        zone_id=payload.zone_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        direction=payload.direction,
        bbox=json.dumps(payload.bbox or []),
        track_id=payload.track_id,
        sensor_snapshot=json.dumps(payload.sensor_snapshot or {}),
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    frame_url = _save_image(payload.frame_jpeg, "frame", event.id)
    crop_url = _save_image(payload.crop_jpeg, "crop", event.id)
    event.frame_url = frame_url
    event.crop_url = crop_url
    session.add(event)
    session.commit()
    return {"id": event.id, "plate_text": event.plate_text}


@router.websocket("/stream")
async def stream_events(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "streaming not yet implemented"})
