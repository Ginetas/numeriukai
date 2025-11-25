from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/streams", tags=["streams"])

BASE = Path("/workspace/numeriukai/edge/hls")


@router.get("/{camera_id}/hls/index.m3u8")
def get_playlist(camera_id: str):
    playlist = BASE / camera_id / "index.m3u8"
    if not playlist.exists():
        raise HTTPException(status_code=404, detail="Playlist not found")
    return FileResponse(playlist)


@router.get("/{camera_id}/hls/{segment}")
def get_segment(camera_id: str, segment: str):
    segment_path = BASE / camera_id / segment
    if not segment_path.exists():
        raise HTTPException(status_code=404, detail="Segment not found")
    return FileResponse(segment_path)
