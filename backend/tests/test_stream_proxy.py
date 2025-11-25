from pathlib import Path

from app.routers.streams import get_playlist
from fastapi import HTTPException


def test_stream_playlist_missing(tmp_path, monkeypatch):
    monkeypatch.setattr("app.routers.streams.BASE", tmp_path)
    try:
        get_playlist("cam1")
        assert False, "Expected HTTPException"
    except HTTPException as exc:  # noqa: PIE786
        assert exc.status_code == 404


def test_stream_playlist_found(tmp_path, monkeypatch):
    monkeypatch.setattr("app.routers.streams.BASE", tmp_path)
    cam_dir = tmp_path / "cam1"
    cam_dir.mkdir()
    playlist = cam_dir / "index.m3u8"
    playlist.write_text("#EXTM3U")
    response = get_playlist("cam1")
    assert response.path == playlist
