from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, WebSocket
from sqlmodel import Session, select

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/events", tags=["events"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


@router.post("/ingest")
def ingest_event(payload: schemas.PlateEventIngest, session: Session = Depends(get_session)) -> dict:
    event = models.PlateEvent(
        plate=payload.plate,
        camera_id=payload.camera_id,
        zone_id=payload.zone_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        meta=json.dumps(payload.meta or {}),
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    import asyncio

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            manager.broadcast(
                {
                    "id": event.id,
                    "plate": event.plate,
                    "camera_id": event.camera_id,
                    "zone_id": event.zone_id,
                    "timestamp": event.timestamp.isoformat(),
                    "meta": json.loads(event.meta or "{}"),
                }
            )
        )
    except RuntimeError:
        # If no loop exists (sync context), skip broadcast
        pass
    return {"id": event.id, "plate": event.plate}


@router.get("/", response_model=list[schemas.PlateEventRead])
def list_events(
    session: Session = Depends(get_session),
    limit: int = 50,
    plate: Optional[str] = None,
    camera_id: Optional[int] = None,
):
    statement = select(models.PlateEvent).order_by(models.PlateEvent.timestamp.desc()).limit(limit)
    if plate:
        statement = statement.where(models.PlateEvent.plate.ilike(f"%{plate}%"))
    if camera_id:
        statement = statement.where(models.PlateEvent.camera_id == camera_id)
    results = session.exec(statement).all()
    events: List[schemas.PlateEventRead] = []
    for evt in results:
        events.append(
            schemas.PlateEventRead(
                id=evt.id or 0,
                plate=evt.plate,
                camera_id=evt.camera_id,
                zone_id=evt.zone_id,
                timestamp=evt.timestamp,
                meta=json.loads(evt.meta or "{}"),
            )
        )
    return events


@router.websocket("/stream")
async def stream_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"message": "subscribed"})
        while True:
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)
