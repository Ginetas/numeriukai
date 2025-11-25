"""REST exporter stub."""
from __future__ import annotations

import json
import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)


class RestExporter:
    name = "rest"

    def __init__(self, config: dict) -> None:
        self.config = config
        self.endpoint = config.get("endpoint")

    def send(self, event: dict) -> None:
        if not self.endpoint:
            raise ValueError("REST endpoint not configured")
        logger.info("Sending event to REST %s", self.endpoint)
        response = requests.post(self.endpoint, json=event, timeout=5)
        response.raise_for_status()
