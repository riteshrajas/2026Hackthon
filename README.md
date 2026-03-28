# 🧠 Pocket AI Agent — 2026 Hackathon

> *"We built a pocket AI agent that doesn't just answer questions — it takes action in the real world using embedded systems."*

A portable, voice-first AI agent built on **FREE-WILi** that talks, thinks, acts, and learns.

---

## 🚀 Overview

| Layer | Technology |
|-------|-----------|
| 🧠 AI Brain | Gemini (reasoning + planning) |
| 🎙️ Voice | ElevenLabs (STT + TTS) |
| ☁️ Cloud | Vultr (backend + orchestration) |
| 🔌 Hardware | FREE-WILi (GPIO, SPI, I2C, UART, display) |

---

## 🏗️ Architecture

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

---

## 📁 Project Structure

```
2026Hackthon/
├── main.py              # Entry point
├── config.py            # Configuration & API keys
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
│
├── agent/               # AI agent core
│   ├── brain.py         # Gemini LLM reasoning
│   ├── voice.py         # ElevenLabs STT/TTS
│   ├── planner.py       # Task decomposition & planning
│   └── sub_agents.py    # Autonomous sub-agent management
│
├── hardware/            # FREE-WILi hardware interfaces
│   ├── freewili.py      # Main device interface
│   ├── gpio.py          # GPIO / I2C / SPI / UART control
│   └── display.py       # 320×240 on-device display
│
├── cloud/               # Cloud backend
│   └── vultr.py         # Vultr orchestration client
│
├── tests/               # Unit tests
│   ├── test_brain.py
│   ├── test_sub_agents.py
│   └── test_hardware.py
│
└── docs/
    └── architecture.md  # Detailed architecture notes
```

---

## ⚡ Quick Start

### 1. Clone & install dependencies

```bash
git clone https://github.com/riteshrajas/2026Hackthon.git
cd 2026Hackthon
pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

### 3. Run the agent

```bash
python main.py
```

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for a full list. Key variables:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `ELEVENLABS_API_KEY` | ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID |
| `VULTR_API_KEY` | Vultr cloud API key |
| `FREEWILI_PORT` | Serial port for FREE-WILi device |

---

## 🧪 Running Tests

```bash
pytest tests/
```

---

## 🎤 Demo Scenarios

### Demo 1 — "Do Something Physical"
```
User: "Turn on my LED and greet me"
→ LED turns on + device speaks back
```

### Demo 2 — Sub-Agent Creation
```
User: "Create a study mode agent"
→ Turns off distractions (IR)
→ Plays focus sound
→ Lights LED blue
```

### Demo 3 — Hacker Mode
```
User: "Scan nearby RF signals"
→ CC1101 radio scans + AI explains results
```

---

## 👥 Team

- **Adeeba** — adeeba.aam@gmail.com
- **Ritesh Raj** — [@riteshrajas](https://github.com/riteshrajas)

---

## 📄 License

[MIT](LICENSE)