"""WebSocket exporter stub."""
from __future__ import annotations

import asyncio
import json
import logging
import websockets

logger = logging.getLogger(__name__)


class WebSocketExporter:
    name = "websocket"

    def __init__(self, config: dict) -> None:
        self.config = config
        self.endpoint = config.get("endpoint")

    def send(self, event: dict) -> None:
        if not self.endpoint:
            raise ValueError("WebSocket endpoint not configured")
        logger.info("Sending event to WebSocket %s", self.endpoint)
        asyncio.get_event_loop().run_until_complete(self._send(event))

    async def _send(self, event: dict) -> None:
        async with websockets.connect(self.endpoint) as ws:  # type: ignore[arg-type]
            await ws.send(json.dumps(event))
