# Edge konfigūracija

Konfigūracija laikoma YAML faile (`edge/config/cameras.example.yaml`).

```yaml
rtsp_url: rtsp://camera.local/stream

detectors:
  type: yolov5
  confidence_threshold: 0.5
  device: cpu

ocr:
  crnn:
    enabled: true
    checkpoint: /models/crnn.ckpt
  transformer:
    enabled: true
    checkpoint: /models/transformer.pt
  tesseract:
    enabled: true
    language: eng
  aggregator:
    strategy: majority

exporters:
  rest:
    enabled: true
    endpoint: http://backend:8000/events/ingest
  websocket:
    enabled: true
    endpoint: ws://backend:8000/events/stream

sensors:
  tpms:
    enabled: false
    transport: udp
    port: 5555
```

- **RTSP**: GStreamer pipeline turi būti integruotas `RTSPIngest` klasėje.
- **OCR**: CRNN/Transformer/Tesseract stubai gali būti pakeisti realiais adapteriais.
- **TPMS**: `transport` gali būti `udp` arba `mqtt`, `tpms_listener.py` numato stubą.
- **Exporters**: REST ir WebSocket endpointai backendui.
