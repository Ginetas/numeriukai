"""Simple centroid tracker stub."""
from __future__ import annotations

import itertools
from dataclasses import dataclass
from typing import Dict, List

from pipeline import Detection


@dataclass
class Track:
    track_id: int
    detection: Detection


class CentroidTracker:
    def __init__(self, max_disappeared: int = 5):
        self.next_id = itertools.count(1)
        self.tracks: Dict[int, Track] = {}
        self.max_disappeared = max_disappeared

    def update(self, detections: List[Detection]) -> List[Track]:
        updated_tracks: List[Track] = []
        for det in detections:
            track_id = next(self.next_id)
            track = Track(track_id=track_id, detection=det)
            self.tracks[track_id] = track
            updated_tracks.append(track)
        return updated_tracks
