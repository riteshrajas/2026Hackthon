"""
config.py — Centralised configuration for the Pocket AI Agent.

All values are loaded from environment variables (via .env) so that no
secrets are hard-coded in source.
"""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

# ── Logging ──────────────────────────────────────────────────────────────────
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ── Google Gemini ─────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# ── ElevenLabs ───────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "")

# ── Vultr cloud backend ───────────────────────────────────────────────────────
VULTR_API_KEY: str = os.getenv("VULTR_API_KEY", "")
VULTR_BACKEND_URL: str = os.getenv("VULTR_BACKEND_URL", "")

# ── FREE-WILi hardware ────────────────────────────────────────────────────────
FREEWILI_PORT: str = os.getenv("FREEWILI_PORT", "/dev/ttyUSB0")
FREEWILI_BAUD: int = int(os.getenv("FREEWILI_BAUD", "115200"))
