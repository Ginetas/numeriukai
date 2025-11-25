"""
Edge worker settings and configuration loading utilities.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict

import yaml


CONFIG_PATH = Path(__file__).parent / "config" / "cameras.example.yaml"
RETRY_QUEUE_PATH = Path(__file__).parent / "exporters" / "retry_queue.json"


@dataclass
class EdgeConfig:
    rtsp_url: str
    detectors: Dict[str, Any] = field(default_factory=dict)
    ocr: Dict[str, Any] = field(default_factory=dict)
    exporters: Dict[str, Any] = field(default_factory=dict)
    sensors: Dict[str, Any] = field(default_factory=dict)


def load_config(path: Path = CONFIG_PATH) -> EdgeConfig:
    data = yaml.safe_load(path.read_text())
    return EdgeConfig(**data)


def load_retry_queue(path: Path = RETRY_QUEUE_PATH) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text())


def save_retry_queue(queue: list[dict[str, Any]], path: Path = RETRY_QUEUE_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(queue, indent=2))
