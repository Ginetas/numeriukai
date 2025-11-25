"""Edge pipeline skeleton for ingesting RTSP streams and producing plate events."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

from settings import EdgeConfig, load_config
from tracker import CentroidTracker
from ocr.ensemble import OCREnsemble
from exporters.dispatcher import ExportDispatcher

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    bbox: tuple[int, int, int, int]
    score: float
    label: str


class RTSPIngest:
    def __init__(self, rtsp_url: str) -> None:
        self.rtsp_url = rtsp_url

    def frames(self) -> Iterator[bytes]:
        logger.info("Starting RTSP ingest for %s", self.rtsp_url)
        # Placeholder: integrate GStreamer or OpenCV capture here
        for _ in range(3):
            yield b"fake-frame"


class Detector:
    def __init__(self, config: dict) -> None:
        self.config = config

    def detect(self, frame: bytes) -> list[Detection]:
        # Placeholder detection logic
        return [Detection(bbox=(0, 0, 100, 50), score=0.9, label="plate")]


class EdgePipeline:
    def __init__(self, config: EdgeConfig) -> None:
        self.config = config
        self.ingest = RTSPIngest(config.rtsp_url)
        self.detector = Detector(config.detectors)
        self.tracker = CentroidTracker(max_disappeared=5)
        self.ocr = OCREnsemble(config.ocr)
        self.exporter = ExportDispatcher(config.exporters)

    def run(self) -> None:
        logger.info("Edge pipeline starting")
        for frame in self.ingest.frames():
            detections = self.detector.detect(frame)
            tracked = self.tracker.update(detections)
            for track in tracked:
                plate_text = self.ocr.recognize(frame, track)
                event = self.ocr.build_event(track, plate_text)
                self.exporter.dispatch(event)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    config_path = EdgeConfig.__annotations__.get("config_path", None)
    config = load_config()
    pipeline = EdgePipeline(config)
    pipeline.run()


if __name__ == "__main__":
    main()
