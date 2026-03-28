"""
hardware/display.py — 320×240 on-device display interface.

Provides a minimal `Display` class for rendering text and simple UI
elements on the FREE-WILi's built-in screen.  Runs in stub (print) mode
when no hardware is connected.
"""

from __future__ import annotations

import logging
import textwrap
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# Display constants
DISPLAY_WIDTH = 320
DISPLAY_HEIGHT = 240
CHAR_WIDTH = 8   # approximate pixels per character (monospace)
CHAR_HEIGHT = 16


class Display:
    """
    Minimal display controller for the FREE-WILi 320×240 screen.

    When *serial_port* is None the display runs in stub mode and renders
    output to the terminal instead, which is useful for development and
    testing.
    """

    def __init__(self, serial_port=None) -> None:
        self._port = serial_port
        self._stub = serial_port is None
        if self._stub:
            logger.warning("Display running in stub mode — rendering to terminal.")
        self._lines: list[str] = []

    # ── Public API ────────────────────────────────────────────────────────────

    def clear(self) -> None:
        """Clear the display."""
        self._lines = []
        if self._stub:
            print("\033[2J\033[H", end="")  # ANSI clear screen
            return
        self._send_command(0x01)  # firmware: clear screen

    def print_line(self, text: str, row: int = 0, col: int = 0) -> None:
        """Print *text* at the given character *row* and *col*."""
        # Wrap to display width
        max_chars = DISPLAY_WIDTH // CHAR_WIDTH
        wrapped = textwrap.wrap(text, width=max_chars) or [""]
        for i, line in enumerate(wrapped):
            self._lines.append(line)
            if self._stub:
                print(f"[DISPLAY row={row + i}] {line}")
            else:
                self._send_text(line, row + i, col)

    def show_status(self, status: str) -> None:
        """Display a one-line status message at the bottom of the screen."""
        bottom_row = DISPLAY_HEIGHT // CHAR_HEIGHT - 1
        self.print_line(f"» {status}", row=bottom_row)

    def render_menu(self, title: str, items: list[str]) -> None:
        """Render a simple text menu with a title and selectable items."""
        self.clear()
        self.print_line(title.upper().center(DISPLAY_WIDTH // CHAR_WIDTH), row=0)
        self.print_line("─" * (DISPLAY_WIDTH // CHAR_WIDTH), row=1)
        for i, item in enumerate(items):
            self.print_line(f"  {i + 1}. {item}", row=2 + i)

    # ── Internal ──────────────────────────────────────────────────────────────

    def _send_command(self, cmd: int) -> None:
        if self._port:
            try:
                self._port.write(bytes([0xD0, cmd]))
            except Exception as exc:  # pragma: no cover
                logger.error("Display command failed: %s", exc)

    def _send_text(self, text: str, row: int, col: int) -> None:
        if self._port:
            encoded = text.encode("ascii", errors="replace")
            header = bytes([0xD1, row & 0xFF, col & 0xFF, len(encoded)])
            try:
                self._port.write(header + encoded)
            except Exception as exc:  # pragma: no cover
                logger.error("Display text write failed: %s", exc)
