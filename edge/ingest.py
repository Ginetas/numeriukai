"""RTSP ingest helpers built on top of OpenCV + GStreamer."""
from __future__ import annotations

import logging
import time
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class RtspCameraIngest:
    def __init__(
        self,
        rtsp_url: str,
        target_fps: int | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> None:
        self.rtsp_url = rtsp_url
        self.target_fps = target_fps
        self.width = width
        self.height = height
        self._capture: Optional[cv2.VideoCapture] = None
        self._last_frame_time = 0.0

    def _build_pipeline(self) -> str:
        parts = [
            f"rtspsrc location={self.rtsp_url} latency=200 !",
            "rtpjitterbuffer !",
            "rtph264depay ! h264parse !",
            "avdec_h264 !",
            "videoconvert !",
            "appsink drop=1",
        ]
        if self.target_fps:
            parts.insert(-1, f"videorate max-rate={self.target_fps} !")
        if self.width and self.height:
            parts.insert(-1, f"videoscale ! video/x-raw,width={self.width},height={self.height} !")
        return " ".join(parts)

    def _open(self) -> None:
        if self._capture is not None:
            self._capture.release()
        pipeline = self._build_pipeline()
        logger.info("Opening RTSP stream via pipeline: %s", pipeline)
        self._capture = cv2.VideoCapture(pipeline, cv2.CAP_GSTREAMER)
        if not self._capture.isOpened():
            logger.warning("Failed to open RTSP stream, retrying with direct url")
            self._capture = cv2.VideoCapture(self.rtsp_url)
        if not self._capture.isOpened():
            raise RuntimeError(f"Unable to open RTSP stream {self.rtsp_url}")

    def read(self) -> np.ndarray | None:
        if self._capture is None:
            self._open()
        assert self._capture is not None

        if self.target_fps:
            now = time.time()
            delay = max(0.0, (1 / self.target_fps) - (now - self._last_frame_time))
            if delay:
                time.sleep(delay)
            self._last_frame_time = time.time()

        ret, frame = self._capture.read()
        if not ret or frame is None:
            logger.warning("RTSP frame grab failed, attempting reconnect")
            try:
                self._open()
            except Exception as exc:  # noqa: BLE001
                logger.error("Reconnect failed: %s", exc)
                time.sleep(1)
                return None
            ret, frame = self._capture.read()
            if not ret:
                return None
        return frame
