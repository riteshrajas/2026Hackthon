# Pocket AI Agent — Architecture

## Overview

```
[User Voice]
     ↓
[ElevenLabs STT/TTS]
     ↓
[Gemini Brain]
     ↓
[Task Planner]
     ↓
 ┌───────────────┬────────────────┐
 │ Sub-Agent Sys │ Device Control │
 └───────────────┴────────────────┘
        ↓                ↓
    [Vultr Cloud]   [FREE-WILi GPIO]
```

## Component Descriptions

### `agent/brain.py` — Gemini Brain
- Wraps Google Gemini (`gemini-1.5-flash` default)
- Maintains conversation history per session
- Emits structured JSON action blocks for the Planner

### `agent/voice.py` — Voice Interface
- **TTS**: ElevenLabs `generate()` → PCM audio → `sounddevice` playback
- **STT**: Microphone capture via `sounddevice` → ElevenLabs `scribe_v1`
- Falls back to `stdin` when hardware/API is unavailable

### `agent/planner.py` — Task Planner
- Parses fenced JSON `actions` blocks from LLM responses
- Each `Action` has a `type` and a `params` dictionary
- Falls back to a single `speak` action for plain-text LLM replies

### `agent/sub_agents.py` — Sub-Agent Registry
- Named, persistent micro-workflows
- Scheduled via APScheduler (`cron` or `interval` triggers)
- Stored in-memory; optionally persisted via VultrClient

### `hardware/freewili.py` — FREE-WILi Device
- Manages serial connection lifecycle
- Exposes `gpio` and `display` properties

### `hardware/gpio.py` — GPIO Controller
- GPIO set/get, I2C read/write, SPI transfer, UART send
- Command protocol: single-byte command ID + payload over UART

### `hardware/display.py` — Display
- 320×240 pixel screen, ~40×15 character grid
- `print_line`, `show_status`, `render_menu` helpers

### `cloud/vultr.py` — Vultr Client
- REST client for backend API
- Persists sub-agent definitions, logs telemetry events

## Data Flow: Voice → Action

1. `VoiceInterface.listen()` captures audio and transcribes it
2. `Brain.think(text)` sends the text to Gemini, receives a response
3. `Planner.parse(response)` extracts a list of `Action` objects
4. Each `Action` is dispatched by the executor function in `main.py`
5. Hardware actions → `FreeWili.gpio` / `FreeWili.display`
6. Voice actions → `VoiceInterface.speak()`
7. Sub-agent creation → `SubAgentRegistry.create()`
8. Event logged → `VultrClient.log_event()`

## Stub / Offline Mode

Every component degrades gracefully:
- No Gemini key → stub responses prefixed with `[STUB]`
- No ElevenLabs key → `print()` to console
- No FREE-WILi port → GPIO/display log operations instead of writing serial
- No Vultr backend → cloud calls silently no-op
