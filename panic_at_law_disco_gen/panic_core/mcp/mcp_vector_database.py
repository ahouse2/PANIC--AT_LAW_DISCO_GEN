"""MCP wrapper for VectorDatabaseManager operations (add/query/count).

Contracts
- name: mcp_vector.add_documents
  args: { documents: [str], metadatas: [obj], ids: [str] }
  returns: { added: int }

- name: mcp_vector.query
  args: { q?: str, n_results?: int, where?: obj }
  returns: { documents: [[str]], metadatas: [[obj]], ids: [[str]] }

- name: mcp_vector.count
  args: {}
  returns: { count: int }
"""

from __future__ import annotations

from typing import Any, Dict, List


def _manager(case_id: int | str | None = None):
    try:
        from coded_tools.legal_discovery.vector_database_manager import VectorDatabaseManager
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc
    return VectorDatabaseManager(case_id=case_id)


def add_documents(documents: List[str], metadatas: List[dict], ids: List[str], case_id: int | str | None = None) -> Dict[str, Any]:
    if not isinstance(documents, list) or not all(isinstance(d, str) for d in documents):
        raise ValueError("documents must be a list of strings")
    if not isinstance(metadatas, list) or not all(isinstance(m, dict) for m in metadatas):
        raise ValueError("metadatas must be a list of objects")
    if not isinstance(ids, list) or not all(isinstance(i, str) for i in ids):
        raise ValueError("ids must be a list of strings")
    mgr = _manager(case_id=case_id)
    mgr.add_documents(documents=documents, metadatas=metadatas, ids=ids)
    return {"added": len(documents)}


def query(q: str | None = None, n_results: int = 10, where: Dict | None = None, case_id: int | str | None = None) -> Dict[str, Any]:
    mgr = _manager(case_id=case_id)
    return mgr.query_documents(query_texts=[q] if q else None, n_results=n_results, where=where)


def count(case_id: int | str | None = None) -> Dict[str, int]:
    mgr = _manager(case_id=case_id)
    return {"count": mgr.get_document_count()}
