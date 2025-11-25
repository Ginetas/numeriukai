# OCR Ensemble

Three stub models (CRNN, Transformer, Tesseract) each expose `predict(crop) -> (text, confidence)`. The ensemble supports majority, weighted, and beam-search reduction using the `run_ensemble` helper. Configuration is delivered from the backend via `/config/ocr-ensemble` and includes enabled models, weights, method, and beam width.
