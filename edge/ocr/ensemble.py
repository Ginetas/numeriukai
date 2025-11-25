"""OCR ensemble orchestrator."""
from __future__ import annotations

from collections import Counter
from typing import Dict, Tuple

from . import crnn_model, tesseract_model, transformer_model


def _majority(votes: Dict[str, float]) -> Tuple[str, float]:
    if not votes:
        return "", 0.0
    text = Counter(votes).most_common(1)[0][0]
    return text, votes[text]


def _weighted(votes: Dict[str, float]) -> Tuple[str, float]:
    if not votes:
        return "", 0.0
    text = max(votes, key=votes.get)
    return text, votes[text]


def _beam_search(votes: Dict[str, float], beam_width: int = 2) -> Tuple[str, float]:
    if not votes:
        return "", 0.0
    sorted_votes = sorted(votes.items(), key=lambda kv: kv[1], reverse=True)
    pruned = sorted_votes[:beam_width]
    text, conf = pruned[0]
    return text, conf


METHODS = {
    "majority": _majority,
    "weighted": _weighted,
    "beam-search": _beam_search,
}


def run_ensemble(crop, config: Dict) -> Tuple[str, float]:
    predictions = {}
    enabled_models = config.get("enabled_models", ["crnn", "transformer", "tesseract"])
    weights = config.get("weights", {"crnn": 1.0, "transformer": 1.0, "tesseract": 1.0})
    if "crnn" in enabled_models:
        text, conf = crnn_model.predict(crop)
        predictions[text] = predictions.get(text, 0) + conf * weights.get("crnn", 1.0)
    if "transformer" in enabled_models:
        text, conf = transformer_model.predict(crop)
        predictions[text] = predictions.get(text, 0) + conf * weights.get("transformer", 1.0)
    if "tesseract" in enabled_models:
        text, conf = tesseract_model.predict(crop)
        predictions[text] = predictions.get(text, 0) + conf * weights.get("tesseract", 1.0)
    method = config.get("method", "majority")
    beam_width = config.get("beam_width", 2)
    reducer = METHODS.get(method, _majority)
    return reducer(predictions) if method != "beam-search" else _beam_search(predictions, beam_width)
