"""GStreamer-based RTSP to HLS pipeline helper."""
from __future__ import annotations

import subprocess
from pathlib import Path


def build_hls_command(rtsp_url: str, camera_id: str, output_dir: Path) -> list[str]:
    target_dir = output_dir / camera_id
    target_dir.mkdir(parents=True, exist_ok=True)
    playlist = target_dir / "index.m3u8"
    return [
        "gst-launch-1.0",
        "-v",
        "rtspsrc", f"location={rtsp_url}", "!", "rtph264depay", "!", "h264parse",
        "!", "avdec_h264", "!", "videoconvert", "!", "x264enc", "tune=zerolatency",
        "!", "h264parse", "!", "mpegtsmux",
        "!", "hlssink", f"location={target_dir}/segment%05d.ts", f"playlist-location={playlist}",
    ]


def launch_hls_pipeline(rtsp_url: str, camera_id: str, output_dir: Path) -> subprocess.Popen:
    cmd = build_hls_command(rtsp_url, camera_id, output_dir)
    return subprocess.Popen(cmd)
