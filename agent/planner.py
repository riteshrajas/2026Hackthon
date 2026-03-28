"""
agent/planner.py — Task decomposition and action planning.

The Planner takes a raw LLM response (which may contain a JSON "actions"
block) and converts it into a sequence of structured `Action` objects that
can be dispatched to hardware or cloud modules.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class Action:
    """A single executable action produced by the planner."""

    type: str                        # e.g. "gpio_set", "speak", "sub_agent_create"
    params: Dict[str, Any] = field(default_factory=dict)
    description: str = ""

    def __repr__(self) -> str:  # pragma: no cover
        return f"Action(type={self.type!r}, params={self.params})"


class Planner:
    """
    Parses LLM output and produces an ordered list of `Action` objects.

    Expected LLM JSON format (embedded anywhere in the response text)::

        ```json
        {
          "actions": [
            {"type": "gpio_set", "params": {"pin": 13, "value": 1}},
            {"type": "speak",    "params": {"text": "Hello!"}}
          ]
        }
        ```
    """

    _JSON_BLOCK_RE = re.compile(
        r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL | re.IGNORECASE
    )

    def parse(self, llm_response: str) -> List[Action]:
        """Extract and return actions from an LLM response string."""
        actions: List[Action] = []

        # Try to find a fenced JSON block first
        match = self._JSON_BLOCK_RE.search(llm_response)
        if match:
            try:
                data = json.loads(match.group(1))
                raw_actions = data.get("actions", [])
                for raw in raw_actions:
                    actions.append(
                        Action(
                            type=raw.get("type", "unknown"),
                            params=raw.get("params", {}),
                            description=raw.get("description", ""),
                        )
                    )
                logger.debug("Planner parsed %d action(s).", len(actions))
                return actions
            except json.JSONDecodeError as exc:
                logger.warning("Could not parse JSON actions block: %s", exc)

        # Fallback: the entire response is a plain text reply → just speak it
        if llm_response.strip():
            actions.append(
                Action(
                    type="speak",
                    params={"text": llm_response.strip()},
                    description="Plain text LLM reply",
                )
            )

        return actions

    def describe(self, actions: List[Action]) -> str:
        """Return a human-readable summary of *actions*."""
        if not actions:
            return "No actions to execute."
        lines = [f"  {i + 1}. [{a.type}] {a.description or a.params}" for i, a in enumerate(actions)]
        return "Planned actions:\n" + "\n".join(lines)
