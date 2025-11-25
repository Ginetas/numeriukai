from fastapi import APIRouter

router = APIRouter(prefix="/exporters", tags=["exporters"])


@router.get("/")
async def list_exporter_status() -> dict:
    return {"exporters": []}
