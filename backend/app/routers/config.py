from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from .. import models, schemas
from ..deps import get_session

router = APIRouter(prefix="/config", tags=["config"])


def _paginate(query, session: Session, offset: int, limit: int):
    return session.exec(query.offset(offset).limit(limit)).all()


def _create_entity(session: Session, model, payload):
    entity = model(**payload.dict())
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


# Cameras
@router.post("/cameras", response_model=schemas.CameraRead, status_code=status.HTTP_201_CREATED)
def create_camera(payload: schemas.CameraCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Camera, payload)


@router.get("/cameras", response_model=list[schemas.CameraRead])
def list_cameras(
    *,
    session: Session = Depends(get_session),
    enabled: bool | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    query = select(models.Camera)
    if enabled is not None:
        query = query.where(models.Camera.enabled == enabled)
    return _paginate(query, session, offset, limit)


@router.get("/cameras/{camera_id}", response_model=schemas.CameraRead)
def get_camera(camera_id: int, session: Session = Depends(get_session)):
    camera = session.get(models.Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.put("/cameras/{camera_id}", response_model=schemas.CameraRead)
def update_camera(
    camera_id: int, payload: schemas.CameraCreate, session: Session = Depends(get_session)
):
    camera = session.get(models.Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    for key, value in payload.dict().items():
        setattr(camera, key, value)
    session.add(camera)
    session.commit()
    session.refresh(camera)
    return camera


@router.delete("/cameras/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(camera_id: int, session: Session = Depends(get_session)):
    camera = session.get(models.Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    session.delete(camera)
    session.commit()


# Zones
@router.post("/zones", response_model=schemas.ZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(payload: schemas.ZoneCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Zone, payload)


@router.get("/zones", response_model=list[schemas.ZoneRead])
def list_zones(
    *, session: Session = Depends(get_session), offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)
):
    return _paginate(select(models.Zone), session, offset, limit)


@router.get("/zones/{zone_id}", response_model=schemas.ZoneRead)
def get_zone(zone_id: int, session: Session = Depends(get_session)):
    zone = session.get(models.Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.put("/zones/{zone_id}", response_model=schemas.ZoneRead)
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


@router.delete("/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: int, session: Session = Depends(get_session)):
    zone = session.get(models.Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    session.delete(zone)
    session.commit()


# Models
@router.post("/models", response_model=schemas.ModelConfigRead, status_code=status.HTTP_201_CREATED)
def create_model(payload: schemas.ModelConfigCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.ModelConfig, payload)


@router.get("/models", response_model=list[schemas.ModelConfigRead])
def list_models(
    *, session: Session = Depends(get_session), offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)
):
    return _paginate(select(models.ModelConfig), session, offset, limit)


@router.get("/models/{model_id}", response_model=schemas.ModelConfigRead)
def get_model(model_id: int, session: Session = Depends(get_session)):
    model = session.get(models.ModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model config not found")
    return model


@router.put("/models/{model_id}", response_model=schemas.ModelConfigRead)
def update_model(
    model_id: int, payload: schemas.ModelConfigCreate, session: Session = Depends(get_session)
):
    model = session.get(models.ModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model config not found")
    for key, value in payload.dict().items():
        setattr(model, key, value)
    session.add(model)
    session.commit()
    session.refresh(model)
    return model


@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(model_id: int, session: Session = Depends(get_session)):
    model = session.get(models.ModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model config not found")
    session.delete(model)
    session.commit()


# Sensors
@router.post("/sensors", response_model=schemas.SensorRead, status_code=status.HTTP_201_CREATED)
def create_sensor(payload: schemas.SensorCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Sensor, payload)


@router.get("/sensors", response_model=list[schemas.SensorRead])
def list_sensors(
    *, session: Session = Depends(get_session), offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)
):
    return _paginate(select(models.Sensor), session, offset, limit)


@router.get("/sensors/{sensor_id}", response_model=schemas.SensorRead)
def get_sensor(sensor_id: int, session: Session = Depends(get_session)):
    sensor = session.get(models.Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor


@router.put("/sensors/{sensor_id}", response_model=schemas.SensorRead)
def update_sensor(
    sensor_id: int, payload: schemas.SensorCreate, session: Session = Depends(get_session)
):
    sensor = session.get(models.Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    for key, value in payload.dict().items():
        setattr(sensor, key, value)
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor


@router.delete("/sensors/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(sensor_id: int, session: Session = Depends(get_session)):
    sensor = session.get(models.Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    session.delete(sensor)
    session.commit()


# Exporters
@router.post("/exporters", response_model=schemas.ExporterRead, status_code=status.HTTP_201_CREATED)
def create_exporter(payload: schemas.ExporterCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.Exporter, payload)


@router.get("/exporters", response_model=list[schemas.ExporterRead])
def list_exporters(
    *, session: Session = Depends(get_session), enabled: bool | None = None, offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)
):
    query = select(models.Exporter)
    if enabled is not None:
        query = query.where(models.Exporter.enabled == enabled)
    return _paginate(query, session, offset, limit)


@router.get("/exporters/{exporter_id}", response_model=schemas.ExporterRead)
def get_exporter(exporter_id: int, session: Session = Depends(get_session)):
    exporter = session.get(models.Exporter, exporter_id)
    if not exporter:
        raise HTTPException(status_code=404, detail="Exporter not found")
    return exporter


@router.put("/exporters/{exporter_id}", response_model=schemas.ExporterRead)
def update_exporter(
    exporter_id: int, payload: schemas.ExporterCreate, session: Session = Depends(get_session)
):
    exporter = session.get(models.Exporter, exporter_id)
    if not exporter:
        raise HTTPException(status_code=404, detail="Exporter not found")
    for key, value in payload.dict().items():
        setattr(exporter, key, value)
    session.add(exporter)
    session.commit()
    session.refresh(exporter)
    return exporter


@router.delete("/exporters/{exporter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exporter(exporter_id: int, session: Session = Depends(get_session)):
    exporter = session.get(models.Exporter, exporter_id)
    if not exporter:
        raise HTTPException(status_code=404, detail="Exporter not found")
    session.delete(exporter)
    session.commit()
