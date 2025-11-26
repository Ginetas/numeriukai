from __future__ import annotations

import logging
from pathlib import Path
from typing import List

import cv2
import numpy as np
import onnxruntime as ort
import requests

from .base import OcrResult, PlateOcr

logger = logging.getLogger(__name__)

MODEL_URL = "https://github.com/AIWintermuteAI/aionnxexamples/releases/download/plate_recognition/LPRNet.onnx"


class LPRNetOCR(PlateOcr):
    def __init__(self, weights_path: str, charset: str, input_size: tuple[int, int] = (24, 94)) -> None:
        self.weights_path = Path(weights_path)
        if not self.weights_path.exists():
            self._download_model()
        self.session = ort.InferenceSession(str(self.weights_path), providers=["CPUExecutionProvider"])
        self.charset: List[str] = list(charset)
        self.blank_idx = len(self.charset)
        self.input_size = input_size

    def _download_model(self) -> None:
        self.weights_path.parent.mkdir(parents=True, exist_ok=True)
        logger.info("Downloading LPRNet weights to %s", self.weights_path)
        resp = requests.get(MODEL_URL, timeout=60)
        resp.raise_for_status()
        self.weights_path.write_bytes(resp.content)

    def _preprocess(self, plate_crop: np.ndarray) -> np.ndarray:
        h, w = self.input_size
        img = cv2.resize(plate_crop, (w, h))
        img = img.astype(np.float32) / 255.0
        img = (img - 0.5) / 0.5
        img = np.transpose(img, (2, 0, 1))[None, ...]
        return img

    def _ctc_decode(self, logits: np.ndarray) -> OcrResult:
        logits = np.squeeze(logits)
        best_path = np.argmax(logits, axis=0)
        probs = np.max(logits, axis=0)
        collapsed: List[int] = []
        previous = None
        for idx in best_path:
            if idx != previous and idx != self.blank_idx:
                collapsed.append(int(idx))
            previous = idx
        text = "".join(self.charset[idx] for idx in collapsed)
        confidence = float(np.mean(probs)) if probs.size else 0.0
        return OcrResult(text=text, confidence=confidence)

    def infer(self, plate_crop: np.ndarray) -> OcrResult | None:
        if plate_crop is None or plate_crop.size == 0:
            return None
        img = self._preprocess(plate_crop)
        logits = self.session.run(None, {self.session.get_inputs()[0].name: img})[0]
        result = self._ctc_decode(logits)
        if not result.text:
            return None
        return result
