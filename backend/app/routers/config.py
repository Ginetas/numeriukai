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


@router.get("/ocr-models", response_model=list[models.OCRModel])
def list_ocr_models(session: Session = Depends(get_session)):
    return session.exec(select(models.OCRModel).order_by(models.OCRModel.priority)).all()


@router.post("/ocr-models", response_model=models.OCRModel)
def create_ocr_model(payload: schemas.OCRModelCreate, session: Session = Depends(get_session)):
    return _create_entity(session, models.OCRModel, payload)


@router.put("/ocr-models/{model_id}", response_model=models.OCRModel)
def update_ocr_model(model_id: int, payload: schemas.OCRModelCreate, session: Session = Depends(get_session)):
    model = session.get(models.OCRModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    for field, value in payload.dict().items():
        setattr(model, field, value)
    session.add(model)
    session.commit()
    session.refresh(model)
    return model


@router.delete("/ocr-models/{model_id}")
def delete_ocr_model(model_id: int, session: Session = Depends(get_session)):
    model = session.get(models.OCRModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    session.delete(model)
    session.commit()
    return {"status": "deleted"}


@router.get("/ocr-ensemble", response_model=models.OCREnsembleConfig | None)
def get_ensemble(session: Session = Depends(get_session)):
    return session.exec(select(models.OCREnsembleConfig)).first()


@router.put("/ocr-ensemble", response_model=models.OCREnsembleConfig)
def update_ensemble(payload: schemas.OCREnsembleUpdate, session: Session = Depends(get_session)):
    existing = session.exec(select(models.OCREnsembleConfig)).first()
    if not existing:
        existing = models.OCREnsembleConfig(
            enabled_models=",".join(payload.enabled_models),
            weights=str(payload.weights),
            method=payload.method,
            beam_width=payload.beam_width,
        )
    else:
        existing.enabled_models = ",".join(payload.enabled_models)
        existing.weights = str(payload.weights)
        existing.method = payload.method
        existing.beam_width = payload.beam_width
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing
