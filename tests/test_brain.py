"""
tests/test_brain.py — Unit tests for agent.brain.Brain.
"""

import pytest
from unittest.mock import MagicMock, patch

from agent.brain import Brain


class TestBrainStubMode:
    """Brain works without a real API key (stub mode)."""

    def setup_method(self):
        self.brain = Brain(api_key="")

    def test_think_returns_stub_string(self):
        response = self.brain.think("hello")
        assert "[STUB]" in response

    def test_think_includes_input(self):
        response = self.brain.think("test message")
        assert "test message" in response

    def test_reset_conversation_no_error(self):
        # Should not raise even with no model
        self.brain.reset_conversation()


class TestBrainWithMockedGemini:
    """Brain correctly delegates to the Gemini SDK when a key is present."""

    def test_think_returns_model_text(self):
        mock_response = MagicMock()
        mock_response.text = "I will turn on the LED."

        mock_chat = MagicMock()
        mock_chat.send_message.return_value = mock_response

        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_chat

        with patch("agent.brain.Brain._init_model") as mock_init:
            brain = Brain(api_key="fake-key")
            brain._model = mock_model
            brain._chat = mock_chat

        result = brain.think("turn on LED")
        assert result == "I will turn on the LED."
        mock_chat.send_message.assert_called_once_with("turn on LED")

    def test_reset_conversation_creates_new_chat(self):
        mock_model = MagicMock()
        brain = Brain(api_key="")
        brain._model = mock_model

        brain.reset_conversation()
        mock_model.start_chat.assert_called_once_with(history=[])
