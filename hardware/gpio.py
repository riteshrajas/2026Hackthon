"""
hardware/gpio.py — GPIO / I2C / SPI / UART control abstraction.

On a real FREE-WILi device the serial port is used to send structured
commands to the firmware.  In stub / simulation mode the class logs the
intended operations so the rest of the codebase can be developed and tested
without physical hardware.
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Protocol constants (firmware command IDs)
CMD_GPIO_SET = 0x01
CMD_GPIO_GET = 0x02
CMD_I2C_WRITE = 0x10
CMD_I2C_READ = 0x11
CMD_SPI_TRANSFER = 0x20
CMD_UART_SEND = 0x30


class GPIOController:
    """
    Low-level GPIO / protocol controller for FREE-WILi.

    All methods work in stub mode (no serial port) to allow unit testing and
    development without connected hardware.
    """

    def __init__(self, serial_port=None) -> None:
        """
        Parameters
        ----------
        serial_port:
            An open `serial.Serial` instance, or *None* for stub mode.
        """
        self._port = serial_port
        self._stub = serial_port is None
        if self._stub:
            logger.warning("GPIOController running in stub mode — no hardware connected.")

    # ── GPIO ─────────────────────────────────────────────────────────────────

    def set_pin(self, pin: int, value: int) -> None:
        """Drive GPIO *pin* HIGH (value=1) or LOW (value=0)."""
        logger.info("GPIO SET pin=%d value=%d", pin, value)
        if not self._stub:
            self._send(bytes([CMD_GPIO_SET, pin & 0xFF, value & 0x01]))

    def get_pin(self, pin: int) -> int:
        """Read and return the current logic level of GPIO *pin*."""
        logger.info("GPIO GET pin=%d", pin)
        if self._stub:
            return 0
        self._send(bytes([CMD_GPIO_GET, pin & 0xFF]))
        response = self._port.read(1)
        return response[0] if response else 0

    # ── I2C ──────────────────────────────────────────────────────────────────

    def i2c_write(self, address: int, data: bytes) -> None:
        """Write *data* to I2C device at *address*."""
        logger.info("I2C WRITE addr=0x%02X data=%s", address, data.hex())
        if not self._stub:
            self._send(bytes([CMD_I2C_WRITE, address & 0xFF, len(data)]) + data)

    def i2c_read(self, address: int, length: int) -> bytes:
        """Read *length* bytes from I2C device at *address*."""
        logger.info("I2C READ addr=0x%02X length=%d", address, length)
        if self._stub:
            return bytes(length)
        self._send(bytes([CMD_I2C_READ, address & 0xFF, length & 0xFF]))
        return self._port.read(length)

    # ── SPI ──────────────────────────────────────────────────────────────────

    def spi_transfer(self, data: bytes) -> bytes:
        """Perform a full-duplex SPI transfer and return the received bytes."""
        logger.info("SPI TRANSFER data=%s", data.hex())
        if self._stub:
            return bytes(len(data))
        self._send(bytes([CMD_SPI_TRANSFER, len(data)]) + data)
        return self._port.read(len(data))

    # ── UART pass-through ─────────────────────────────────────────────────────

    def uart_send(self, message: bytes) -> None:
        """Send *message* over the secondary UART port."""
        logger.info("UART SEND data=%s", message.hex())
        if not self._stub:
            self._send(bytes([CMD_UART_SEND, len(message)]) + message)

    # ── Internal ──────────────────────────────────────────────────────────────

    def _send(self, payload: bytes) -> None:
        """Write *payload* to the serial port."""
        try:
            self._port.write(payload)
        except Exception as exc:  # pragma: no cover
            logger.error("Serial write failed: %s", exc)
