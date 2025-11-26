from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import numpy as np


@dataclass
class OcrResult:
    text: str
    confidence: float


class PlateOcr(Protocol):
    def infer(self, plate_crop: np.ndarray) -> OcrResult | None: ...
