# Live Video

This project exposes an RTSP to HLS pipeline using GStreamer. The pipeline structure is:

```
rtsp -> decode -> videoconvert -> x264 -> h264parse -> mpegtsmux -> hlssink
```

Running `edge/pipeline/hls_pipeline.py` builds a command that writes segments to `edge/hls/<camera_id>/` as `index.m3u8` playlists and `.ts` segments.

The backend provides a thin proxy that serves the HLS output via:

- `GET /streams/{camera_id}/hls/index.m3u8`
- `GET /streams/{camera_id}/hls/{segment}`

Point the frontend `LiveVideoPlayer` to these URLs via the `backendUrl` prop.
