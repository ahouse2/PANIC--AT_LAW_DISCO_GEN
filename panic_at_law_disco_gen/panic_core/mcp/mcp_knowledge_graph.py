"""MCP wrapper for KnowledgeGraphManager (Neo4j upserts/queries).

Contracts
- name: mcp_graph.upsert_document
  args: { case_id: int, metadata: obj }
  returns: { node_id: int }

- name: mcp_graph.add_fact
  args: { case_node_id: int|null, document_node_id: int|null, fact: obj }
  returns: { fact_id: int }

- name: mcp_graph.link_fact_to_element
  args: { fact_id: int, cause: str, element: str, weight?: float, relation?: str }
  returns: { ok: true }
"""

from __future__ import annotations

from typing import Any, Dict


def _kg():
    try:
        from coded_tools.legal_discovery.knowledge_graph_manager import KnowledgeGraphManager
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc
    return KnowledgeGraphManager()


def upsert_document(case_id: int, metadata: Dict[str, Any]) -> Dict[str, int]:
    kg = _kg()
    # MERGE case and create document node
    res = kg.run_query("MERGE (c:Case {id: $id}) RETURN id(c) as cid", {"id": case_id})
    case_node = res[0]["cid"] if res else None
    doc_node = kg.create_node("Document", metadata)
    if case_node is not None:
        kg.create_relationship(case_node, doc_node, "HAS_DOCUMENT")
    return {"node_id": int(doc_node)}


def add_fact(case_node_id: int | None, document_node_id: int | None, fact: Dict[str, Any]) -> Dict[str, int]:
    kg = _kg()
    fact_id = kg.add_fact(case_node_id or -1, document_node_id or -1, fact)
    return {"fact_id": int(fact_id)}


def link_fact_to_element(fact_id: int, cause: str, element: str, weight: float | None = None, relation: str = "SUPPORTS") -> Dict[str, bool]:
    kg = _kg()
    kg.link_fact_to_element(fact_id, cause, element, weight, relation)
    return {"ok": True}
