"""TPMS listener stub for UDP/MQTT messages."""
from __future__ import annotations

import logging
from typing import Callable

logger = logging.getLogger(__name__)


class TPMSListener:
    def __init__(self, config: dict):
        self.config = config

    def start(self, callback: Callable[[dict], None]) -> None:
        transport = self.config.get("transport", "udp")
        logger.info("Starting TPMS listener via %s (stub)", transport)
        sample_payload = {"pressure": 32, "temperature": 25}
        callback(sample_payload)
