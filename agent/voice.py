"""
agent/voice.py — ElevenLabs-powered speech synthesis and voice interaction.

Provides:
  * `speak(text)` — convert text to speech and play it on the device speaker.
  * `listen()`    — record microphone input and return transcribed text.
"""

from __future__ import annotations

import io
import logging
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)


class VoiceInterface:
    """Voice input/output via ElevenLabs and system audio."""

    def __init__(self, api_key: str, voice_id: str) -> None:
        self._api_key = api_key
        self._voice_id = voice_id
        self._client = None

        if api_key and voice_id:
            self._init_client()
        else:
            logger.warning(
                "ElevenLabs credentials not set — voice running in stub mode."
            )

    # ── Private helpers ───────────────────────────────────────────────────────

    def _init_client(self) -> None:
        try:
            from elevenlabs.client import ElevenLabs  # type: ignore

            self._client = ElevenLabs(api_key=self._api_key)
            logger.info("ElevenLabs voice client initialised (voice=%s).", self._voice_id)
        except Exception as exc:  # pragma: no cover
            logger.error("Failed to initialise ElevenLabs: %s", exc)

    def _play_audio(self, audio_bytes: bytes) -> None:
        """Play raw PCM/MP3 bytes through the default audio device."""
        try:
            import sounddevice as sd  # type: ignore
            import numpy as np

            # ElevenLabs returns MP3; use a lightweight approach via soundfile
            import soundfile as sf  # type: ignore

            buf = io.BytesIO(audio_bytes)
            data, samplerate = sf.read(buf)
            sd.play(data, samplerate=samplerate, blocking=True)
        except Exception as exc:  # pragma: no cover
            logger.error("Audio playback failed: %s", exc)

    # ── Public API ────────────────────────────────────────────────────────────

    def speak(self, text: str) -> None:
        """Synthesise *text* and play it on the speaker."""
        if self._client is None:
            print(f"[SPEAK] {text}")
            return

        try:
            audio = self._client.generate(
                text=text,
                voice=self._voice_id,
                model="eleven_monolingual_v1",
            )
            audio_bytes = b"".join(audio)
            self._play_audio(audio_bytes)
        except Exception as exc:  # pragma: no cover
            logger.error("TTS failed: %s", exc)
            print(f"[SPEAK FALLBACK] {text}")

    def listen(self, duration_seconds: float = 5.0, sample_rate: int = 16000) -> str:
        """Record from the microphone and return transcribed text.

        In stub mode (no credentials) this falls back to reading from stdin.
        """
        try:
            import sounddevice as sd  # type: ignore
            import numpy as np

            logger.info("Listening for %.1f seconds …", duration_seconds)
            recording = sd.rec(
                int(duration_seconds * sample_rate),
                samplerate=sample_rate,
                channels=1,
                dtype="int16",
            )
            sd.wait()

            # Transcription via ElevenLabs (or a local Whisper fallback)
            return self._transcribe(recording, sample_rate)
        except Exception as exc:
            logger.warning("Audio capture failed (%s), falling back to stdin.", exc)
            return input("You: ")

    def _transcribe(self, audio_array, sample_rate: int) -> str:
        """Transcribe a NumPy audio array to text."""
        try:
            import numpy as np
            import soundfile as sf  # type: ignore

            buf = io.BytesIO()
            sf.write(buf, audio_array, sample_rate, format="WAV")
            buf.seek(0)

            if self._client is not None:
                # ElevenLabs speech-to-text
                result = self._client.speech_to_text.convert(
                    file=("audio.wav", buf, "audio/wav"),
                    model_id="scribe_v1",
                )
                return result.text
        except Exception as exc:
            logger.error("Transcription failed: %s", exc)

        return input("You: ")
