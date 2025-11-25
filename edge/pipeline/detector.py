"""Detector stub used for unit testing and integration scaffolding."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class Detection:
    bbox: list[float]
    confidence: float
    cls: str


def detect_objects(frame) -> List[dict]:
    """Return a synthetic detection to emulate a vehicle detector.

    Args:
        frame: Placeholder for an image frame.
    Returns:
        List of detections represented as dictionaries.
    """
    # Using a fixed bounding box ensures deterministic tests.
    detection = {"bbox": [100, 100, 200, 120], "confidence": 0.95, "class": "vehicle"}
    return [detection]
