"""
hardware/freewili.py — Top-level FREE-WILi device interface.

`FreeWili` is the main entry point for all hardware interactions.  It
manages the serial connection and exposes the GPIO controller and display
as properties.
"""

from __future__ import annotations

import logging
from typing import Optional

from hardware.gpio import GPIOController
from hardware.display import Display

logger = logging.getLogger(__name__)


class FreeWili:
    """
    Top-level interface for the FREE-WILi embedded device.

    Usage::

        device = FreeWili(port="/dev/ttyUSB0", baud=115200)
        device.connect()
        device.gpio.set_pin(13, 1)   # turn on LED
        device.display.print_line("Hello, World!")
        device.disconnect()

    When *port* is None the device runs in stub mode — ideal for
    development without physical hardware.
    """

    def __init__(self, port: Optional[str] = None, baud: int = 115200) -> None:
        self._port_name = port
        self._baud = baud
        self._serial = None
        self._gpio: Optional[GPIOController] = None
        self._display: Optional[Display] = None

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def gpio(self) -> GPIOController:
        if self._gpio is None:
            self._gpio = GPIOController(self._serial)
        return self._gpio

    @property
    def display(self) -> Display:
        if self._display is None:
            self._display = Display(self._serial)
        return self._display

    @property
    def is_connected(self) -> bool:
        return self._serial is not None

    # ── Connection management ─────────────────────────────────────────────────

    def connect(self) -> bool:
        """Open the serial connection to the FREE-WILi device."""
        if self._port_name is None:
            logger.info("FreeWili: no port specified — running in stub mode.")
            return False

        try:
            import serial  # type: ignore

            self._serial = serial.Serial(self._port_name, self._baud, timeout=2)
            # Refresh sub-interfaces with the live port
            self._gpio = GPIOController(self._serial)
            self._display = Display(self._serial)
            logger.info(
                "FreeWili connected on %s @ %d baud.", self._port_name, self._baud
            )
            return True
        except Exception as exc:
            logger.error("Failed to connect to FREE-WILi: %s", exc)
            return False

    def disconnect(self) -> None:
        """Close the serial connection."""
        if self._serial is not None:
            try:
                self._serial.close()
            except Exception:  # pragma: no cover
                pass
            self._serial = None
            logger.info("FreeWili disconnected.")

    # ── Context manager support ───────────────────────────────────────────────

    def __enter__(self) -> "FreeWili":
        self.connect()
        return self

    def __exit__(self, *args) -> None:
        self.disconnect()
