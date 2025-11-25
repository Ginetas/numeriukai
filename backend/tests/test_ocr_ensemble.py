from edge.ocr.ensemble import run_ensemble


def test_ensemble_majority():
    text, conf = run_ensemble(None, {"method": "majority"})
    assert text
    assert conf > 0


def test_ensemble_beam():
    text, conf = run_ensemble(None, {"method": "beam-search", "beam_width": 1})
    assert text
    assert conf > 0
