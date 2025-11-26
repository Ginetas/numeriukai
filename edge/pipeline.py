"""Edge pipeline for real RTSP ingest, detection, tracking and OCR."""
from __future__ import annotations

import base64
import logging
import time
from typing import Iterator

import numpy as np

from detector import Detector, Detection
from event_builder import EventBuilder, PlateEvent
from ingest import RtspCameraIngest
from ocr.lprnet import LPRNetOCR
from settings import EdgeConfig, load_config
from tracker import CentroidTracker, Track
from exporters.dispatcher import ExportDispatcher

logger = logging.getLogger(__name__)


class EdgePipeline:
    def __init__(self, config: EdgeConfig) -> None:
        self.config = config
        self.ingest = RtspCameraIngest(config.rtsp_url, target_fps=config.target_fps, width=config.width, height=config.height)
        detector_cfg = config.detectors or {}
        self.detector = Detector(
            weights_path=detector_cfg.get("weights", "models/detector/yolo_plate.onnx"),
            conf=detector_cfg.get("confidence", 0.25),
            iou=detector_cfg.get("iou", 0.45),
        )
        charset = config.ocr.get("charset", "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        ocr_weights = config.ocr.get("weights", "models/ocr/lprnet.onnx")
        self.ocr = LPRNetOCR(weights_path=ocr_weights, charset=charset)
        self.tracker = CentroidTracker(max_disappeared=10, max_distance=detector_cfg.get("max_distance", 80.0))
        self.builder = EventBuilder(camera_id=config.camera_id)
        self.exporter = ExportDispatcher(config.exporters)
        self.plate_min_conf = config.ocr.get("min_confidence", 0.4)
        self.min_hits = config.ocr.get("min_hits", 2)

    def _prepare_event_payload(self, event: PlateEvent) -> dict:
        payload = event.model_dump()
        payload["frame_jpeg"] = base64.b64encode(event.frame_jpeg).decode("utf-8")
        payload["crop_jpeg"] = base64.b64encode(event.crop_jpeg).decode("utf-8")
        return payload

    def _iter_frames(self) -> Iterator[np.ndarray]:
        while True:
            frame = self.ingest.read()
            if frame is None:
                continue
            yield frame

    def run(self) -> None:
        logger.info("Edge pipeline starting for camera %s", self.config.camera_id)
        for frame in self._iter_frames():
            start = time.time()
            detections = self.detector.detect(frame)
            plates = [det for det in detections if det.cls == "plate"]
            tracks = self.tracker.update(plates)
            for track, det in zip(tracks, plates):
                if track.hits < self.min_hits:
                    continue
                crop = frame[int(det.bbox[1]) : int(det.bbox[3]), int(det.bbox[0]) : int(det.bbox[2])]
                ocr_result = self.ocr.infer(crop)
                if not ocr_result or ocr_result.confidence < self.plate_min_conf:
                    continue
                event = self.builder.build(frame, track, det, ocr_result)
                payload = self._prepare_event_payload(event)
                logger.info("Dispatching plate %s (conf %.2f)", ocr_result.text, ocr_result.confidence)
                self.exporter.dispatch(payload)
            logger.debug("Frame processed in %.3fs", time.time() - start)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    config = load_config()
    pipeline = EdgePipeline(config)
    pipeline.run()


if __name__ == "__main__":
    main()
