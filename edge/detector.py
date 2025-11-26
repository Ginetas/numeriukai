"""ONNX-based detector for vehicle and plate detection."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List

import cv2
import numpy as np
import onnxruntime as ort
import requests

logger = logging.getLogger(__name__)

MODEL_URL = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx"


def _download_model(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    logger.info("Downloading detector weights to %s", path)
    resp = requests.get(MODEL_URL, timeout=60)
    resp.raise_for_status()
    path.write_bytes(resp.content)


@dataclass
class Detection:
    bbox: tuple[float, float, float, float]
    score: float
    cls: str


class Detector:
    def __init__(self, weights_path: str, conf: float = 0.25, iou: float = 0.45) -> None:
        self.weights_path = Path(weights_path)
        if not self.weights_path.exists():
            _download_model(self.weights_path)
        providers = ("CPUExecutionProvider",)
        self.session = ort.InferenceSession(str(self.weights_path), providers=list(providers))
        self.conf = conf
        self.iou = iou
        meta = self.session.get_inputs()[0].shape
        self.input_shape = (meta[2], meta[3]) if len(meta) == 4 else (640, 640)
        self.class_names = ["car", "plate"]  # placeholder mapping for plate-focused model

    def _preprocess(self, frame: np.ndarray) -> tuple[np.ndarray, float, float]:
        h, w, _ = frame.shape
        target_h, target_w = self.input_shape
        scale = min(target_w / w, target_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(frame, (new_w, new_h))
        canvas = np.zeros((target_h, target_w, 3), dtype=np.uint8)
        canvas[: new_h, : new_w] = resized
        img = canvas[:, :, ::-1].astype(np.float32) / 255.0
        img = np.transpose(img, (2, 0, 1))[None, ...]
        return img, scale, 0.0

    def _nms(self, boxes: np.ndarray, scores: np.ndarray) -> List[int]:
        indices: List[int] = []
        x1, y1, x2, y2 = boxes.T
        areas = (x2 - x1) * (y2 - y1)
        order = scores.argsort()[::-1]
        while order.size > 0:
            i = order[0]
            indices.append(int(i))
            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])
            w = np.maximum(0.0, xx2 - xx1)
            h = np.maximum(0.0, yy2 - yy1)
            inter = w * h
            ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)
            order = order[1:][ovr <= self.iou]
        return indices

    def detect(self, frame: np.ndarray) -> list[Detection]:
        import cv2  # lazy import to avoid unnecessary dependency at module import

        img, scale, _ = self._preprocess(frame)
        outputs = self.session.run(None, {self.session.get_inputs()[0].name: img})[0]
        outputs = np.squeeze(outputs)
        scores = outputs[:, 4:]
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)
        mask = confidences > self.conf
        boxes = outputs[mask, :4]
        confidences = confidences[mask]
        class_ids = class_ids[mask]
        if boxes.size == 0:
            return []
        boxes[:, 0:2] = boxes[:, 0:2] - boxes[:, 2:4] / 2
        boxes[:, 2:4] = boxes[:, 0:2] + boxes[:, 2:4]
        boxes /= scale
        keep = self._nms(boxes, confidences)
        detections: list[Detection] = []
        for idx in keep:
            x1, y1, x2, y2 = boxes[idx]
            cls_id = int(class_ids[idx])
            label = self.class_names[cls_id % len(self.class_names)]
            detections.append(
                Detection(bbox=(float(x1), float(y1), float(x2), float(y2)), score=float(confidences[idx]), cls=label)
            )
        return detections
