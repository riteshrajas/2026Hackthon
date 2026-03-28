"""
tests/test_hardware.py — Unit tests for hardware modules in stub mode.
"""

import pytest
from hardware.gpio import GPIOController
from hardware.display import Display
from hardware.freewili import FreeWili


class TestGPIOControllerStub:
    def setup_method(self):
        self.gpio = GPIOController(serial_port=None)

    def test_set_pin_no_error(self):
        self.gpio.set_pin(13, 1)  # should not raise

    def test_get_pin_returns_zero_in_stub(self):
        value = self.gpio.get_pin(13)
        assert value == 0

    def test_i2c_read_returns_zero_bytes_in_stub(self):
        result = self.gpio.i2c_read(0x48, 4)
        assert result == bytes(4)

    def test_spi_transfer_returns_zero_bytes_in_stub(self):
        result = self.gpio.spi_transfer(b"\x01\x02")
        assert result == bytes(2)

    def test_uart_send_no_error(self):
        self.gpio.uart_send(b"hello")  # should not raise


class TestDisplayStub:
    def setup_method(self):
        self.display = Display(serial_port=None)

    def test_clear_no_error(self):
        self.display.clear()

    def test_print_line_stores_text(self):
        self.display.print_line("Hello World", row=0)
        assert any("Hello World" in line for line in self.display._lines)

    def test_show_status_no_error(self):
        self.display.show_status("Ready")

    def test_render_menu_no_error(self):
        self.display.render_menu("Main Menu", ["Option 1", "Option 2"])


class TestFreeWiliStub:
    def test_stub_mode_connect_returns_false(self):
        device = FreeWili(port=None)
        result = device.connect()
        assert result is False

    def test_is_connected_false_before_connect(self):
        device = FreeWili(port=None)
        assert device.is_connected is False

    def test_gpio_property_accessible_in_stub(self):
        device = FreeWili(port=None)
        gpio = device.gpio
        assert gpio is not None

    def test_display_property_accessible_in_stub(self):
        device = FreeWili(port=None)
        display = device.display
        assert display is not None

    def test_context_manager_no_error(self):
        with FreeWili(port=None) as device:
            assert device is not None


class TestPlannerIntegration:
    """Planner correctly parses LLM output into Action objects."""

    def setup_method(self):
        from agent.planner import Planner
        self.planner = Planner()

    def test_parse_json_block(self):
        llm_output = '''
Sure! Here you go:

```json
{
  "actions": [
    {"type": "gpio_set", "params": {"pin": 13, "value": 1}},
    {"type": "speak",    "params": {"text": "LED on!"}}
  ]
}
```
'''
        actions = self.planner.parse(llm_output)
        assert len(actions) == 2
        assert actions[0].type == "gpio_set"
        assert actions[1].type == "speak"
        assert actions[1].params["text"] == "LED on!"

    def test_parse_plain_text_becomes_speak(self):
        actions = self.planner.parse("Hello, how can I help you?")
        assert len(actions) == 1
        assert actions[0].type == "speak"

    def test_parse_empty_string_returns_empty(self):
        actions = self.planner.parse("")
        assert actions == []

    def test_describe_empty(self):
        result = self.planner.describe([])
        assert "No actions" in result
