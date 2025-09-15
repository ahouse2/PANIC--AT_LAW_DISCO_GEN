"""MCP wrapper for FactExtractor and ontology matching.

Contract
- name: mcp_fact_extractor.extract
- args: { text: str, source_reliability?: float }
- returns: { facts: [...], count: int }
"""

from __future__ import annotations

from typing import Any, Dict


def extract(text: str, source_reliability: float = 1.0) -> Dict[str, Any]:
    """Return extracted facts with relationships and confidence using coded tool."""
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string")
    if not isinstance(source_reliability, (int, float)) or not (0 <= source_reliability <= 1):
        raise ValueError("source_reliability must be in [0,1]")

    try:
        from coded_tools.legal_discovery.fact_extractor import FactExtractor
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc

    fx = FactExtractor()
    facts = fx.extract(text, source_reliability=source_reliability)
    return {"facts": facts, "count": len(facts)}
