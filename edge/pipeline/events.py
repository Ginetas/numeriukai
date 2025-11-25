"""Event generation utilities."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class ZoneEvent:
    event_type: str
    track_id: int
    zone_id: Optional[int] = None
    plate_text: Optional[str] = None
    bbox: Optional[list[float]] = None


def build_plate_event(track_id: int, plate_text: str, bbox: list[float]) -> ZoneEvent:
    return ZoneEvent(event_type="plate_detected", track_id=track_id, plate_text=plate_text, bbox=bbox)
