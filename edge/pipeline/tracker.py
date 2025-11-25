"""Simple centroid tracker with IOU matching stub."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple


def _iou(box_a: Tuple[float, float, float, float], box_b: Tuple[float, float, float, float]) -> float:
    xa1, ya1, wa, ha = box_a
    xb1, yb1, wb, hb = box_b
    xa2, ya2 = xa1 + wa, ya1 + ha
    xb2, yb2 = xb1 + wb, yb1 + hb
    inter_x1, inter_y1 = max(xa1, xb1), max(ya1, yb1)
    inter_x2, inter_y2 = min(xa2, xb2), min(ya2, yb2)
    inter_w, inter_h = max(0, inter_x2 - inter_x1), max(0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h
    area_a = wa * ha
    area_b = wb * hb
    denom = area_a + area_b - inter_area
    return inter_area / denom if denom else 0.0


@dataclass
class Track:
    id: int
    bbox: Tuple[float, float, float, float]
    track_lost: bool = False
    history: List[Tuple[float, float, float, float]] = field(default_factory=list)

    def update(self, bbox: Tuple[float, float, float, float]):
        self.bbox = bbox
        self.history.append(bbox)
        self.track_lost = False


class CentroidTracker:
    def __init__(self, max_lost: int = 5, iou_threshold: float = 0.3):
        self.max_lost = max_lost
        self.iou_threshold = iou_threshold
        self._next_id = 1
        self.tracks: Dict[int, Track] = {}
        self._lost_counts: Dict[int, int] = {}

    def _match(self, detections: List[Tuple[float, float, float, float]]):
        assignments = {}
        for det in detections:
            best_id, best_iou = None, 0.0
            for track_id, track in self.tracks.items():
                iou = _iou(det, track.bbox)
                if iou > best_iou:
                    best_iou = iou
                    best_id = track_id
            if best_iou >= self.iou_threshold and best_id is not None:
                assignments[best_id] = det
            else:
                new_id = self._next_id
                self._next_id += 1
                assignments[new_id] = det
        return assignments

    def update(self, detections: List[Tuple[float, float, float, float]]) -> List[Track]:
        assignments = self._match(detections)
        for track_id, det in assignments.items():
            if track_id not in self.tracks:
                self.tracks[track_id] = Track(id=track_id, bbox=det, history=[det])
                self._lost_counts[track_id] = 0
            else:
                self.tracks[track_id].update(det)
                self._lost_counts[track_id] = 0
        for track_id in list(self.tracks.keys()):
            if track_id not in assignments:
                self._lost_counts[track_id] += 1
                if self._lost_counts[track_id] > self.max_lost:
                    self.tracks[track_id].track_lost = True
        return list(self.tracks.values())
