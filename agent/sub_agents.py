"""
agent/sub_agents.py — Autonomous sub-agent management.

Sub-agents are named, persistent micro-workflows that run on a schedule or
in response to triggers.  They encapsulate a set of `Action` objects and
execute them automatically.

Example usage::

    registry = SubAgentRegistry()
    registry.create(
        name="study_mode",
        description="Activates study mode every weekday morning",
        actions=[
            Action(type="gpio_set", params={"pin": 13, "value": 1}),
            Action(type="speak",    params={"text": "Study mode activated!"}),
        ],
        trigger={"type": "cron", "hour": 8, "minute": 0},
    )
    registry.start_all()
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from agent.planner import Action

logger = logging.getLogger(__name__)


@dataclass
class SubAgent:
    """A named, persistent micro-workflow."""

    name: str
    description: str
    actions: List[Action] = field(default_factory=list)
    trigger: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    _job = None  # APScheduler job handle (set at runtime)

    def run(self, executor: Optional[Callable[[Action], None]] = None) -> None:
        """Execute all actions in this sub-agent."""
        logger.info("SubAgent '%s' executing %d action(s).", self.name, len(self.actions))
        for action in self.actions:
            logger.debug("  → %s", action)
            if executor is not None:
                try:
                    executor(action)
                except Exception as exc:  # pragma: no cover
                    logger.error("Action %s failed: %s", action.type, exc)

    def __repr__(self) -> str:  # pragma: no cover
        return f"SubAgent(name={self.name!r}, enabled={self.enabled})"


class SubAgentRegistry:
    """
    Manages the lifecycle of all sub-agents.

    Uses APScheduler for scheduled execution when available; falls back to
    manual / on-demand execution when the scheduler is not installed.
    """

    def __init__(self, executor: Optional[Callable[[Action], None]] = None) -> None:
        self._agents: Dict[str, SubAgent] = {}
        self._executor = executor
        self._scheduler = None
        self._init_scheduler()

    # ── Private helpers ───────────────────────────────────────────────────────

    def _init_scheduler(self) -> None:
        try:
            from apscheduler.schedulers.background import BackgroundScheduler  # type: ignore

            self._scheduler = BackgroundScheduler()
            logger.info("APScheduler initialised for sub-agents.")
        except ImportError:
            logger.warning("APScheduler not installed — scheduled sub-agents disabled.")

    def _schedule_agent(self, agent: SubAgent) -> None:
        if self._scheduler is None or not agent.trigger:
            return

        trigger_type = agent.trigger.get("type", "")
        try:
            if trigger_type == "cron":
                agent._job = self._scheduler.add_job(
                    agent.run,
                    "cron",
                    kwargs={"executor": self._executor},
                    hour=agent.trigger.get("hour", 0),
                    minute=agent.trigger.get("minute", 0),
                    id=agent.name,
                    replace_existing=True,
                )
            elif trigger_type == "interval":
                agent._job = self._scheduler.add_job(
                    agent.run,
                    "interval",
                    kwargs={"executor": self._executor},
                    seconds=agent.trigger.get("seconds", 60),
                    id=agent.name,
                    replace_existing=True,
                )
            logger.info(
                "Scheduled sub-agent '%s' with trigger %s.", agent.name, agent.trigger
            )
        except Exception as exc:  # pragma: no cover
            logger.error("Could not schedule sub-agent '%s': %s", agent.name, exc)

    # ── Public API ────────────────────────────────────────────────────────────

    def create(
        self,
        name: str,
        description: str,
        actions: Optional[List[Action]] = None,
        trigger: Optional[Dict[str, Any]] = None,
    ) -> SubAgent:
        """Create and register a new sub-agent."""
        agent = SubAgent(
            name=name,
            description=description,
            actions=actions or [],
            trigger=trigger or {},
        )
        self._agents[name] = agent
        logger.info("Sub-agent '%s' created.", name)
        return agent

    def get(self, name: str) -> Optional[SubAgent]:
        """Return the sub-agent with *name*, or None if not found."""
        return self._agents.get(name)

    def list_agents(self) -> List[SubAgent]:
        """Return all registered sub-agents."""
        return list(self._agents.values())

    def remove(self, name: str) -> bool:
        """Remove a sub-agent by name. Returns True if it existed."""
        agent = self._agents.pop(name, None)
        if agent is None:
            return False
        if agent._job is not None:
            try:
                agent._job.remove()
            except Exception:  # pragma: no cover
                pass
        logger.info("Sub-agent '%s' removed.", name)
        return True

    def start_all(self) -> None:
        """Schedule all registered agents and start the scheduler."""
        for agent in self._agents.values():
            self._schedule_agent(agent)
        if self._scheduler is not None and not self._scheduler.running:
            self._scheduler.start()
            logger.info("Sub-agent scheduler started.")

    def stop(self) -> None:
        """Stop the background scheduler."""
        if self._scheduler is not None and self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("Sub-agent scheduler stopped.")
