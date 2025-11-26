"""
Edge worker settings and configuration loading utilities.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict

import yaml

DEFAULT_CONFIG_PATH = Path(__file__).parent / "config" / "cameras.example.yaml"
RETRY_QUEUE_PATH = Path(__file__).parent / "exporters" / "retry_queue.json"


@dataclass
class EdgeConfig:
    rtsp_url: str
    camera_id: str | int = "camera-1"
    target_fps: int | None = None
    width: int | None = None
    height: int | None = None
    detectors: Dict[str, Any] = field(default_factory=dict)
    ocr: Dict[str, Any] = field(default_factory=dict)
    exporters: Dict[str, Any] = field(default_factory=dict)
    sensors: Dict[str, Any] = field(default_factory=dict)


def load_config(path: Path | None = None) -> EdgeConfig:
    config_path = Path(os.getenv("EDGE_CONFIG", path or DEFAULT_CONFIG_PATH))
    data = yaml.safe_load(config_path.read_text())
    backend_url = os.getenv("BACKEND_API_URL")
    if backend_url and data.get("exporters", {}).get("rest"):
        data["exporters"]["rest"]["endpoint"] = f"{backend_url.rstrip('/')}/events/ingest"
    return EdgeConfig(**data)


def load_retry_queue(path: Path = RETRY_QUEUE_PATH) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text())


def save_retry_queue(queue: list[dict[str, Any]], path: Path = RETRY_QUEUE_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(queue, indent=2))
