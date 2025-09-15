"""AG2 registry loader mapping legal_discovery.hocon network to AG2 group chats.

Design
- Reads AG2 manifest and legal_discovery.hocon from ../neuro-san-studio-2/registries
- Constructs ConversableAgents grouped into orchestrator + sub-teams
- Registers MCP tools by role; enforces allowlist and schema validation

Implementation note
- This is a scaffold module: it defines function signatures and docstrings to make
  downstream integration deterministic. Implementations plug in AG2 classes and
  sibling repo paths without changing public interfaces.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List

from autogen.agentchat.conversable_agent import ConversableAgent
from autogen.agentchat.groupchat import GroupChat
from autogen.llm_config import LLMConfig

# MCP wrappers (call sibling coded tools directly)
from panic_at_law_disco_gen.panic_core.mcp import (
    mcp_document_processor,
    mcp_fact_extractor,
    mcp_knowledge_graph,
    mcp_vector_database,
)


def _gemini_llm() -> LLMConfig:
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    # Prefer mounted llm_config.hocon through sibling registries; fall back to direct dict
    return LLMConfig(
        {
            "api_type": "google",
            "model": os.environ.get("AG2_DEFAULT_MODEL", "gemini-2.5-flash"),
            "api_key": api_key,
            "temperature": 0.2,
            "max_tokens": 8192,
        }
    )


def _make_agent(name: str, system_message: str, functions: Dict[str, Any]) -> ConversableAgent:
    # Register Python callables as tools for the agent via function_map
    return ConversableAgent(
        name=name,
        system_message=system_message,
        llm_config=_gemini_llm(),
        function_map=functions,
        parallel_tool_calls=True,
    )


def _toolset_for_team(team: str) -> Dict[str, Any]:
    team = team.lower()
    if team == "document_ingestion":
        return {
            "mcp_document_processor.extract": mcp_document_processor.extract,
        }
    if team == "legal_analysis":
        return {
            "mcp_fact_extractor.extract": mcp_fact_extractor.extract,
            "mcp_knowledge_graph.upsert_document": mcp_knowledge_graph.upsert_document,
            "mcp_knowledge_graph.add_fact": mcp_knowledge_graph.add_fact,
            "mcp_knowledge_graph.link_fact_to_element": mcp_knowledge_graph.link_fact_to_element,
        }
    if team == "vector":
        return {
            "mcp_vector.add_documents": mcp_vector_database.add_documents,
            "mcp_vector.query": mcp_vector_database.query,
            "mcp_vector.count": mcp_vector_database.count,
        }
    return {}


def make_team(name: str, tools: Dict[str, Any] | None = None) -> ConversableAgent:
    """Create a team agent with the provided MCP tools bound as function_map."""
    toolmap = tools if tools is not None else _toolset_for_team(name)
    sysmsg = f"You are the {name} team agent. Use tools precisely and return structured JSON outputs."
    return _make_agent(name=name, system_message=sysmsg, functions=toolmap)


def make_orchestrator(manifest_path: str | None = None) -> tuple[ConversableAgent, GroupChat]:
    """Return an Orchestrator agent and a GroupChat wired to sub-teams.

    The orchestrator delegates to:
    - DocumentIngestion team (file extraction/ingestion tools)
    - LegalAnalysis team (facts + graph)
    - Vector team (embeddings + search)
    """
    orchestrator = _make_agent(
        name="orchestrator",
        system_message=(
            "Coordinate sub-teams to accomplish user requests. "
            "Decide which team should act next. Prefer concise, actionable outputs."
        ),
        functions={},
    )

    doc_team = make_team("document_ingestion")
    legal_team = make_team("legal_analysis")
    vector_team = make_team("vector")

    group = GroupChat(
        agents=[orchestrator, doc_team, legal_team, vector_team],
        messages=[],
        max_round=12,
        speaker_selection_method="auto",
        func_call_filter=True,
    )
    return orchestrator, group
