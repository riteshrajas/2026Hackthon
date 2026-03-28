"""
agent/brain.py — Gemini-powered reasoning and planning brain.

This module wraps the Google Gemini API and exposes a simple `Brain` class
that the rest of the agent uses to think about user requests.
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class Brain:
    """LLM-powered reasoning engine backed by Google Gemini."""

    SYSTEM_PROMPT = (
        "You are a helpful pocket AI agent running on an embedded FREE-WILi device. "
        "You can control hardware (LEDs, GPIO, I2C, SPI, UART), answer questions, "
        "create autonomous sub-agents, and execute real-world tasks. "
        "Be concise. When you need to perform a hardware action, output a JSON block "
        'with the key "actions" containing a list of action objects.'
    )

    def __init__(self, api_key: str, model: str = "gemini-1.5-flash") -> None:
        self._api_key = api_key
        self._model_name = model
        self._model = None
        self._chat = None

        if api_key:
            self._init_model()
        else:
            logger.warning("No Gemini API key provided — brain running in stub mode.")

    # ── Private helpers ───────────────────────────────────────────────────────

    def _init_model(self) -> None:
        try:
            import google.generativeai as genai  # type: ignore

            genai.configure(api_key=self._api_key)
            self._model = genai.GenerativeModel(
                model_name=self._model_name,
                system_instruction=self.SYSTEM_PROMPT,
            )
            self._chat = self._model.start_chat(history=[])
            logger.info("Gemini brain initialised (model=%s).", self._model_name)
        except Exception as exc:  # pragma: no cover
            logger.error("Failed to initialise Gemini: %s", exc)
            self._model = None

    # ── Public API ────────────────────────────────────────────────────────────

    def think(self, user_message: str) -> str:
        """Send *user_message* to the LLM and return its text response."""
        if self._chat is None:
            stub = f"[STUB] Received: {user_message}"
            logger.debug("Brain stub response: %s", stub)
            return stub

        try:
            response = self._chat.send_message(user_message)
            return response.text
        except Exception as exc:  # pragma: no cover
            logger.error("Gemini request failed: %s", exc)
            return f"[ERROR] Brain could not process request: {exc}"

    def reset_conversation(self) -> None:
        """Clear conversation history and start a fresh chat session."""
        if self._model is not None:
            self._chat = self._model.start_chat(history=[])
            logger.debug("Conversation history reset.")
