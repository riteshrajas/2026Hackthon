"""
tests/test_sub_agents.py — Unit tests for agent.sub_agents.
"""

import pytest
from unittest.mock import MagicMock

from agent.planner import Action
from agent.sub_agents import SubAgent, SubAgentRegistry


class TestSubAgent:
    def test_run_calls_executor_for_each_action(self):
        actions = [
            Action(type="speak", params={"text": "Hello"}),
            Action(type="gpio_set", params={"pin": 13, "value": 1}),
        ]
        agent = SubAgent(name="test", description="test agent", actions=actions)
        executor = MagicMock()

        agent.run(executor=executor)

        assert executor.call_count == 2
        executor.assert_any_call(actions[0])
        executor.assert_any_call(actions[1])

    def test_run_without_executor_does_not_raise(self):
        agent = SubAgent(
            name="no_exec",
            description="",
            actions=[Action(type="speak", params={"text": "hi"})],
        )
        agent.run()  # should not raise


class TestSubAgentRegistry:
    def setup_method(self):
        self.registry = SubAgentRegistry()

    def test_create_returns_sub_agent(self):
        agent = self.registry.create(name="demo", description="demo agent")
        assert isinstance(agent, SubAgent)
        assert agent.name == "demo"

    def test_get_returns_created_agent(self):
        self.registry.create(name="alpha", description="alpha")
        agent = self.registry.get("alpha")
        assert agent is not None
        assert agent.name == "alpha"

    def test_get_returns_none_for_missing(self):
        assert self.registry.get("nonexistent") is None

    def test_list_agents_returns_all(self):
        self.registry.create(name="a", description="")
        self.registry.create(name="b", description="")
        names = [a.name for a in self.registry.list_agents()]
        assert "a" in names
        assert "b" in names

    def test_remove_existing_agent(self):
        self.registry.create(name="temp", description="")
        removed = self.registry.remove("temp")
        assert removed is True
        assert self.registry.get("temp") is None

    def test_remove_nonexistent_returns_false(self):
        assert self.registry.remove("ghost") is False

    def test_create_with_actions_and_trigger(self):
        actions = [Action(type="speak", params={"text": "morning"})]
        trigger = {"type": "cron", "hour": 8, "minute": 0}
        agent = self.registry.create(
            name="morning_routine",
            description="daily morning check",
            actions=actions,
            trigger=trigger,
        )
        assert agent.trigger == trigger
        assert len(agent.actions) == 1
