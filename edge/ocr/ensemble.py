"""OCR ensemble with multiple stub recognizers."""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, List

from pipeline import Detection


@dataclass
class OCRResult:
    text: str
    confidence: float


class CRNNRecognizer:
    def __init__(self, config: dict) -> None:
        self.config = config

    def recognize(self, frame: bytes, detection: Detection) -> OCRResult:
        return OCRResult(text="CRNN123", confidence=0.8)


class TransformerRecognizer:
    def __init__(self, config: dict) -> None:
        self.config = config

    def recognize(self, frame: bytes, detection: Detection) -> OCRResult:
        return OCRResult(text="TRF123", confidence=0.85)


class TesseractRecognizer:
    def __init__(self, config: dict) -> None:
        self.config = config

    def recognize(self, frame: bytes, detection: Detection) -> OCRResult:
        return OCRResult(text="TESS123", confidence=0.75)


class OCREnsemble:
    def __init__(self, config: Dict):
        self.config = config
        self.crnn = CRNNRecognizer(config.get("crnn", {}))
        self.transformer = TransformerRecognizer(config.get("transformer", {}))
        self.tesseract = TesseractRecognizer(config.get("tesseract", {}))

    def recognize(self, frame: bytes, detection: Detection) -> str:
        candidates: List[OCRResult] = [
            self.crnn.recognize(frame, detection),
            self.transformer.recognize(frame, detection),
            self.tesseract.recognize(frame, detection),
        ]
        votes: Dict[str, float] = {}
        for candidate in candidates:
            votes[candidate.text] = votes.get(candidate.text, 0) + candidate.confidence
        return max(votes, key=votes.get)

    def build_event(self, track, plate_text: str) -> dict:
        return {
            "track_id": track.track_id,
            "bbox": track.detection.bbox,
            "plate": plate_text,
        }
