"""Centroid/IoU based tracker for associating detections across frames."""
from __future__ import annotations

import itertools
import time
from dataclasses import dataclass
from typing import Dict, List

import numpy as np

from detector import Detection


def _centroid(box: tuple[float, float, float, float]) -> tuple[float, float]:
    x1, y1, x2, y2 = box
    return (x1 + x2) / 2, (y1 + y2) / 2


def _iou(boxA: tuple[float, float, float, float], boxB: tuple[float, float, float, float]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    return interArea / float(boxAArea + boxBArea - interArea + 1e-6)


@dataclass
class Track:
    track_id: int
    bbox: tuple[float, float, float, float]
    last_seen: float
    hits: int
    disappeared: int


class CentroidTracker:
    def __init__(self, max_disappeared: int = 10, max_distance: float = 50.0) -> None:
        self.next_id = itertools.count(1)
        self.tracks: Dict[int, Track] = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def _distance(self, det: Detection, track: Track) -> float:
        c_det = _centroid(det.bbox)
        c_track = _centroid(track.bbox)
        return float(np.linalg.norm(np.subtract(c_det, c_track)))

    def update(self, detections: List[Detection]) -> List[Track]:
        now = time.time()
        updated_tracks: List[Track] = []

        if not self.tracks:
            for det in detections:
                tid = next(self.next_id)
                track = Track(track_id=tid, bbox=det.bbox, last_seen=now, hits=1, disappeared=0)
                self.tracks[tid] = track
                updated_tracks.append(track)
            return updated_tracks

        assigned: set[int] = set()
        for tid, track in list(self.tracks.items()):
            best_det = None
            best_dist = float("inf")
            for det in detections:
                dist = self._distance(det, track)
                if dist < best_dist and dist <= self.max_distance:
                    best_det = det
                    best_dist = dist
            if best_det:
                track.bbox = best_det.bbox
                track.last_seen = now
                track.hits += 1
                track.disappeared = 0
                assigned.add(id(best_det))
                updated_tracks.append(track)
            else:
                track.disappeared += 1
                if track.disappeared > self.max_disappeared:
                    self.tracks.pop(tid, None)
                else:
                    updated_tracks.append(track)

        for det in detections:
            if id(det) in assigned:
                continue
            tid = next(self.next_id)
            track = Track(track_id=tid, bbox=det.bbox, last_seen=now, hits=1, disappeared=0)
            self.tracks[tid] = track
            updated_tracks.append(track)

        return updated_tracks
