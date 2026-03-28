"""
cloud/vultr.py — Vultr cloud backend client.

Handles communication with the Vultr-hosted orchestration server that
provides persistent storage for sub-agents, telemetry, and heavy LLM
inference offloading.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class VultrClient:
    """
    Lightweight HTTP client for the Vultr backend API.

    All methods degrade gracefully when *api_key* or *base_url* are
    empty, so the agent can run fully offline.
    """

    def __init__(self, api_key: str, base_url: str) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._session = None
        self._stub = not (api_key and base_url)

        if self._stub:
            logger.warning("VultrClient running in stub mode — no cloud backend.")
        else:
            self._init_session()

    # ── Private helpers ───────────────────────────────────────────────────────

    def _init_session(self) -> None:
        try:
            import requests  # type: ignore

            self._session = requests.Session()
            self._session.headers.update(
                {
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                }
            )
            logger.info("VultrClient session initialised (backend=%s).", self._base_url)
        except Exception as exc:  # pragma: no cover
            logger.error("Failed to create HTTP session: %s", exc)

    def _request(self, method: str, path: str, **kwargs) -> Optional[Dict[str, Any]]:
        if self._stub or self._session is None:
            logger.debug("VultrClient stub: %s %s", method, path)
            return None
        url = f"{self._base_url}{path}"
        try:
            resp = self._session.request(method, url, timeout=10, **kwargs)
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            logger.error("Vultr API error (%s %s): %s", method, path, exc)
            return None

    # ── Public API ────────────────────────────────────────────────────────────

    def health_check(self) -> bool:
        """Return True if the backend is reachable."""
        result = self._request("GET", "/health")
        if result is None and self._stub:
            return False
        return result is not None

    def save_sub_agent(self, name: str, definition: Dict[str, Any]) -> bool:
        """Persist a sub-agent definition to cloud storage."""
        result = self._request("POST", f"/agents/{name}", json=definition)
        return result is not None

    def load_sub_agents(self) -> List[Dict[str, Any]]:
        """Retrieve all persisted sub-agent definitions."""
        result = self._request("GET", "/agents")
        if isinstance(result, list):
            return result
        return []

    def log_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        """Send a telemetry event to the cloud backend."""
        self._request("POST", "/events", json={"type": event_type, "data": payload})
