"""Edge pipeline skeleton for ingesting RTSP streams and producing plate events."""
from __future__ import annotations

import logging
import random
import string
import time
from dataclasses import dataclass
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
        while True:
            yield b"fake-frame"
            time.sleep(1)


class Detector:
    def __init__(self, config: dict) -> None:
        self.config = config

    def detect(self, frame: bytes) -> list[Detection]:
        return [Detection(bbox=(0, 0, 100, 50), score=0.9, label="plate")]


class EdgePipeline:
    def __init__(self, config: EdgeConfig) -> None:
        self.config = config
        self.ingest = RTSPIngest(config.rtsp_url)
        self.detector = Detector(config.detectors)
        self.tracker = CentroidTracker(max_disappeared=5)
        self.ocr = OCREnsemble(config.ocr)
        self.exporter = ExportDispatcher(config.exporters)

    @staticmethod
    def _fake_plate() -> str:
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        digits = ''.join(random.choices(string.digits, k=3))
        return f"{letters}{digits}"

    def run(self) -> None:
        logger.info("Edge pipeline starting")
        for frame in self.ingest.frames():
            detections = self.detector.detect(frame)
            tracked = self.tracker.update(detections)
            for track in tracked:
                plate_text = self.ocr.recognize(frame, track) or self._fake_plate()
                event = self.ocr.build_event(track, plate_text)
                logger.info("Generated event %s", event)
                self.exporter.dispatch(event)
            time.sleep(10)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    config = load_config()
    pipeline = EdgePipeline(config)
    pipeline.run()


if __name__ == "__main__":
    main()
