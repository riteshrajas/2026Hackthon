"""
main.py — Pocket AI Agent entry point.

Run with:
    python main.py

The agent boots, connects to available hardware & cloud services, then
enters the main voice-first interaction loop.
"""

from __future__ import annotations

import logging

import config
from agent.brain import Brain
from agent.voice import VoiceInterface
from agent.planner import Planner, Action
from agent.sub_agents import SubAgentRegistry
from hardware.freewili import FreeWili
from cloud.vultr import VultrClient

logger = logging.getLogger(__name__)


# ── Action executor ───────────────────────────────────────────────────────────

def build_executor(device: FreeWili, voice: VoiceInterface, registry: SubAgentRegistry):
    """Return a callable that dispatches a single `Action` to hardware/voice."""

    def execute(action: Action) -> None:
        t = action.type
        p = action.params

        if t == "speak":
            voice.speak(p.get("text", ""))

        elif t == "gpio_set":
            device.gpio.set_pin(p.get("pin", 0), p.get("value", 0))

        elif t == "display_text":
            device.display.print_line(p.get("text", ""), row=p.get("row", 0))

        elif t == "display_menu":
            device.display.render_menu(p.get("title", "Menu"), p.get("items", []))

        elif t == "sub_agent_create":
            # Dynamically create a sub-agent from the LLM's response
            registry.create(
                name=p.get("name", "unnamed"),
                description=p.get("description", ""),
                actions=[Action(**a) for a in p.get("actions", [])],
                trigger=p.get("trigger", {}),
            )
            voice.speak(f"Sub-agent '{p.get('name')}' created.")

        else:
            logger.warning("Unknown action type: %s", t)

    return execute


# ── Bootstrap ─────────────────────────────────────────────────────────────────

def main() -> None:
    logger.info("🚀 Pocket AI Agent starting up …")

    # Hardware
    device = FreeWili(port=config.FREEWILI_PORT or None, baud=config.FREEWILI_BAUD)
    device.connect()

    # AI services
    brain = Brain(api_key=config.GEMINI_API_KEY, model=config.GEMINI_MODEL)
    voice = VoiceInterface(
        api_key=config.ELEVENLABS_API_KEY,
        voice_id=config.ELEVENLABS_VOICE_ID,
    )
    planner = Planner()

    # Cloud
    cloud = VultrClient(
        api_key=config.VULTR_API_KEY,
        base_url=config.VULTR_BACKEND_URL,
    )

    # Sub-agent registry — executor is wired after registry is created
    registry = SubAgentRegistry()
    executor = build_executor(device, voice, registry)
    registry._executor = executor
    registry.start_all()

    # ── Greet the user ────────────────────────────────────────────────────────
    device.display.clear()
    device.display.print_line("Pocket AI Agent", row=0)
    device.display.show_status("Ready")
    voice.speak("Pocket AI Agent ready. How can I help you?")

    # ── Main loop ─────────────────────────────────────────────────────────────
    logger.info("Entering main interaction loop. Press Ctrl+C to exit.")
    try:
        while True:
            user_input = voice.listen()
            if not user_input.strip():
                continue

            logger.info("User said: %s", user_input)
            device.display.show_status("Thinking …")

            response = brain.think(user_input)
            logger.info("Brain response: %s", response)

            actions = planner.parse(response)
            logger.info(planner.describe(actions))

            for action in actions:
                executor(action)

            device.display.show_status("Ready")
            cloud.log_event("interaction", {"input": user_input, "actions": len(actions)})

    except KeyboardInterrupt:
        logger.info("Shutting down …")
    finally:
        registry.stop()
        device.disconnect()
        logger.info("Goodbye.")


if __name__ == "__main__":
    main()
