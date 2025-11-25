from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/config", tags=["config"])


def _create_entity(session: Session, model, payload):
    entity = model.from_orm(payload)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


@router.post("/cameras", response_model=models.Camera)
def create_camera(payload: schemas.CameraCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Camera, payload)


@router.get("/cameras", response_model=list[models.Camera])
def list_cameras(session: Session = Depends(get_session)):
    return session.exec(select(models.Camera)).all()


@router.post("/zones", response_model=models.Zone)
def create_zone(payload: schemas.ZoneCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Zone, payload)


@router.get("/zones", response_model=list[models.Zone])
def list_zones(session: Session = Depends(get_session)):
    return session.exec(select(models.Zone)).all()


@router.put("/zones/{zone_id}", response_model=models.Zone)
def update_zone(
    zone_id: int, payload: schemas.ZoneUpdate, session: Session = Depends(get_session)
):
    zone = session.get(models.Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(zone, key, value)

    session.add(zone)
    session.commit()
    session.refresh(zone)
    return zone


@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: int, session: Session = Depends(get_session)):
    zone = session.get(models.Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    session.delete(zone)
    session.commit()
    return {"status": "deleted"}


@router.post("/models", response_model=models.ModelConfig)
def create_model(payload: schemas.ModelConfigCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.ModelConfig, payload)


@router.get("/models", response_model=list[models.ModelConfig])
def list_models(session: Session = Depends(get_session)):
    return session.exec(select(models.ModelConfig)).all()


@router.post("/sensors", response_model=models.Sensor)
def create_sensor(payload: schemas.SensorCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Sensor, payload)


@router.get("/sensors", response_model=list[models.Sensor])
def list_sensors(session: Session = Depends(get_session)):
    return session.exec(select(models.Sensor)).all()


@router.post("/exporters", response_model=models.Exporter)
def create_exporter(payload: schemas.ExporterCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Exporter, payload)


@router.get("/exporters", response_model=list[models.Exporter])
def list_exporters(session: Session = Depends(get_session)):
    return session.exec(select(models.Exporter)).all()
