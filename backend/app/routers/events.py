from fastapi import APIRouter, Depends, WebSocket
from sqlmodel import Session

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/ingest")
def ingest_event(payload: schemas.PlateEventIngest, session: Session = Depends(get_session)) -> dict:
    event = models.PlateEvent(
        plate=payload.plate,
        camera_id=payload.camera_id,
        timestamp=payload.timestamp or None,
        meta=(payload.meta or {}).__str__(),
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return {"id": event.id, "plate": event.plate}


@router.websocket("/stream")
async def stream_events(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "streaming not yet implemented"})
