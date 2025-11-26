from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket
from sqlmodel import Session, select

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/ingest", response_model=schemas.PlateEventRead)
def ingest_event(payload: schemas.PlateEventCreate, session: Session = Depends(get_session)):
    if not payload.plate_text.strip():
        raise HTTPException(status_code=400, detail="plate_text is required")

    event = models.PlateEvent(**payload.dict())
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.get("/search", response_model=list[schemas.PlateEventRead])
def search_events(
    *,
    session: Session = Depends(get_session),
    plate: str | None = None,
    camera_id: int | None = None,
    zone_id: int | None = None,
    from_ts: datetime | None = None,
    to_ts: datetime | None = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    query = select(models.PlateEvent).order_by(models.PlateEvent.timestamp.desc())
    if plate:
        query = query.where(models.PlateEvent.plate_text.ilike(f"%{plate}%"))
    if camera_id:
        query = query.where(models.PlateEvent.camera_id == camera_id)
    if zone_id:
        query = query.where(models.PlateEvent.zone_id == zone_id)
    if from_ts:
        query = query.where(models.PlateEvent.timestamp >= from_ts)
    if to_ts:
        query = query.where(models.PlateEvent.timestamp <= to_ts)

    return session.exec(query.offset(offset).limit(limit)).all()


@router.websocket("/stream")
async def stream_events(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "event streaming coming soon"})
