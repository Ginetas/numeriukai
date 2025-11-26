from datetime import datetime

from fastapi.testclient import TestClient


def test_create_and_list_cameras(client: TestClient):
    create_payload = {
        "name": "Gate cam",
        "rtsp_url": "rtsp://example/stream",
        "fps": 25,
        "resolution_width": 1920,
        "resolution_height": 1080,
    }
    response = client.post("/config/cameras", json=create_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Gate cam"

    list_resp = client.get("/config/cameras")
    assert list_resp.status_code == 200
    cams = list_resp.json()
    assert len(cams) == 1
    assert cams[0]["rtsp_url"] == create_payload["rtsp_url"]


def test_ingest_plate_event_and_search(client: TestClient):
    ingest_payload = {
        "plate_text": "ABC123",
        "timestamp": datetime.utcnow().isoformat(),
        "confidence": 0.92,
    }
    create_resp = client.post("/events/ingest", json=ingest_payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["plate_text"] == "ABC123"

    search_resp = client.get("/events/search?plate=ABC")
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert any(event["plate_text"] == "ABC123" for event in results)
