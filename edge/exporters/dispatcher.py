"""Dispatcher handling multiple exporters with retry queue."""
from __future__ import annotations

import logging
from typing import Dict, List

from settings import load_retry_queue, save_retry_queue
from .rest import RestExporter
from .websocket import WebSocketExporter

logger = logging.getLogger(__name__)


class ExportDispatcher:
    def __init__(self, config: Dict):
        self.config = config
        self.exporters = []
        if config.get("rest", {}).get("enabled", False):
            self.exporters.append(RestExporter(config["rest"]))
        if config.get("websocket", {}).get("enabled", False):
            self.exporters.append(WebSocketExporter(config["websocket"]))
        self.retry_queue = load_retry_queue()
        if self.retry_queue:
            logger.info("Retrying %d queued events", len(self.retry_queue))
            self._flush_retry_queue()

    def dispatch(self, event: dict) -> None:
        logger.info("Dispatching event %s", event)
        failed: List[dict] = []
        for exporter in self.exporters:
            try:
                exporter.send(event)
            except Exception as exc:  # noqa: BLE001
                logger.error("Exporter %s failed: %s", exporter, exc)
                failed.append({"exporter": exporter.name, "event": event})
        if failed:
            self.retry_queue.extend(failed)
            save_retry_queue(self.retry_queue)

    def _flush_retry_queue(self) -> None:
        remaining: List[dict] = []
        for item in self.retry_queue:
            target = next((exp for exp in self.exporters if exp.name == item.get("exporter")), None)
            if not target:
                remaining.append(item)
                continue
            try:
                target.send(item["event"])
            except Exception:
                remaining.append(item)
        self.retry_queue = remaining
        save_retry_queue(self.retry_queue)
