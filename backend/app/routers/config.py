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


def _update_entity(session: Session, model, entity_id: int, payload):
    entity = session.get(model, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(entity, key, value)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


def _delete_entity(session: Session, model, entity_id: int):
    entity = session.get(model, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(entity)
    session.commit()
    return {"status": "deleted", "id": entity_id}


@router.post("/cameras", response_model=schemas.CameraRead)
def create_camera(payload: schemas.CameraCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Camera, payload)


@router.get("/cameras", response_model=list[schemas.CameraRead])
def list_cameras(session: Session = Depends(get_session)):
    return session.exec(select(models.Camera)).all()


@router.put("/cameras/{camera_id}", response_model=schemas.CameraRead)
def update_camera(camera_id: int, payload: schemas.CameraUpdate, session: Session = Depends(get_session)):
    return _update_entity(session, models.Camera, camera_id, payload)


@router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int, session: Session = Depends(get_session)):
    return _delete_entity(session, models.Camera, camera_id)


@router.post("/zones", response_model=schemas.ZoneRead)
def create_zone(payload: schemas.ZoneCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Zone, payload)


@router.get("/zones", response_model=list[schemas.ZoneRead])
def list_zones(session: Session = Depends(get_session)):
    return session.exec(select(models.Zone)).all()


@router.put("/zones/{zone_id}", response_model=schemas.ZoneRead)
def update_zone(zone_id: int, payload: schemas.ZoneUpdate, session: Session = Depends(get_session)):
    return _update_entity(session, models.Zone, zone_id, payload)


@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: int, session: Session = Depends(get_session)):
    return _delete_entity(session, models.Zone, zone_id)


@router.post("/models", response_model=schemas.ModelConfigRead)
def create_model(payload: schemas.ModelConfigCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.ModelConfig, payload)


@router.get("/models", response_model=list[schemas.ModelConfigRead])
def list_models(session: Session = Depends(get_session)):
    return session.exec(select(models.ModelConfig)).all()


@router.put("/models/{model_id}", response_model=schemas.ModelConfigRead)
def update_model(model_id: int, payload: schemas.ModelConfigUpdate, session: Session = Depends(get_session)):
    return _update_entity(session, models.ModelConfig, model_id, payload)


@router.delete("/models/{model_id}")
def delete_model(model_id: int, session: Session = Depends(get_session)):
    return _delete_entity(session, models.ModelConfig, model_id)


@router.post("/sensors", response_model=schemas.SensorRead)
def create_sensor(payload: schemas.SensorCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Sensor, payload)


@router.get("/sensors", response_model=list[schemas.SensorRead])
def list_sensors(session: Session = Depends(get_session)):
    return session.exec(select(models.Sensor)).all()


@router.put("/sensors/{sensor_id}", response_model=schemas.SensorRead)
def update_sensor(sensor_id: int, payload: schemas.SensorUpdate, session: Session = Depends(get_session)):
    return _update_entity(session, models.Sensor, sensor_id, payload)


@router.delete("/sensors/{sensor_id}")
def delete_sensor(sensor_id: int, session: Session = Depends(get_session)):
    return _delete_entity(session, models.Sensor, sensor_id)


@router.post("/exporters", response_model=schemas.ExporterRead)
def create_exporter(payload: schemas.ExporterCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Exporter, payload)


@router.get("/exporters", response_model=list[schemas.ExporterRead])
def list_exporters(session: Session = Depends(get_session)):
    return session.exec(select(models.Exporter)).all()


@router.put("/exporters/{exporter_id}", response_model=schemas.ExporterRead)
def update_exporter(exporter_id: int, payload: schemas.ExporterUpdate, session: Session = Depends(get_session)):
    return _update_entity(session, models.Exporter, exporter_id, payload)


@router.delete("/exporters/{exporter_id}")
def delete_exporter(exporter_id: int, session: Session = Depends(get_session)):
    return _delete_entity(session, models.Exporter, exporter_id)
