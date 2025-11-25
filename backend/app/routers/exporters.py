from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from .. import models
from ..deps import get_session

router = APIRouter(prefix="/exporters", tags=["exporters"])


@router.get("/", response_model=list[models.Exporter])
async def list_exporter_status(session: Session = Depends(get_session)) -> list[models.Exporter]:
    return session.exec(select(models.Exporter)).all()


@router.post("/{exporter_id}/test")
async def test_exporter(exporter_id: int, session: Session = Depends(get_session)) -> dict:
    exporter = session.get(models.Exporter, exporter_id)
    if not exporter:
        raise HTTPException(status_code=404, detail="Exporter not found")
    # Stub dispatch - in a real implementation we would fan out
    exporter.last_status = "success"
    session.add(exporter)
    session.commit()
    return {"status": "ok", "exporter_id": exporter_id}
