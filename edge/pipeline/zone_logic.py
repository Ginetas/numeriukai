"""Zone crossing logic stub."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence, Tuple

from .events import ZoneEvent

Point = Tuple[float, float]
Polygon = Sequence[Point]


def _centroid(bbox: Tuple[float, float, float, float]) -> Point:
    x, y, w, h = bbox
    return x + w / 2, y + h / 2


def _point_in_polygon(point: Point, polygon: Polygon) -> bool:
    x, y = point
    inside = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-6) + xi):
            inside = not inside
        j = i
    return inside


@dataclass
class ZoneState:
    zone_id: int
    contains: Dict[int, bool]


def evaluate_zone_crossings(tracks: List[Dict], zones: Dict[int, Polygon], state: Dict[int, ZoneState]) -> List[ZoneEvent]:
    events: List[ZoneEvent] = []
    for track in tracks:
        centroid = _centroid(tuple(track["bbox"]))
        for zone_id, polygon in zones.items():
            inside = _point_in_polygon(centroid, polygon)
            zone_state = state.setdefault(zone_id, ZoneState(zone_id=zone_id, contains={}))
            was_inside = zone_state.contains.get(track["id"], False)
            if inside and not was_inside:
                events.append(ZoneEvent(event_type="entered_zone", track_id=track["id"], zone_id=zone_id))
            if was_inside and not inside:
                events.append(ZoneEvent(event_type="exited_zone", track_id=track["id"], zone_id=zone_id))
            zone_state.contains[track["id"]] = inside
    return events
