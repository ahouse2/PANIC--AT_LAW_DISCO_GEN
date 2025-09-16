"""MCP wrappers for ForensicTools operations.

Contracts
- name: mcp_forensic.hash_file
  args: { filepath: str }
  returns: { sha256: str }

- name: mcp_forensic.pdf_meta
  args: { filepath: str }
  returns: { metadata: object }

- name: mcp_forensic.image_meta
  args: { filepath: str }
  returns: { metadata: object }

- name: mcp_forensic.authenticity
  args: { filepath: str }
  returns: { report: str }

- name: mcp_forensic.financial
  args: { filepath: str }
  returns: { report: str }
"""

from __future__ import annotations

from typing import Any, Dict


def _tool():
    try:
        from coded_tools.legal_discovery.forensic_tools import ForensicTools
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc
    return ForensicTools()


def hash_file(filepath: str) -> Dict[str, str]:
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath is required")
    t = _tool()
    return {"sha256": t.get_file_hash(filepath)}


def pdf_meta(filepath: str) -> Dict[str, Any]:
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath is required")
    t = _tool()
    return {"metadata": t.get_pdf_metadata(filepath)}


def image_meta(filepath: str) -> Dict[str, Any]:
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath is required")
    t = _tool()
    return {"metadata": t.get_image_metadata(filepath)}


def authenticity(filepath: str) -> Dict[str, str]:
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath is required")
    t = _tool()
    return {"report": t.analyze_document_authenticity(filepath)}


def financial(filepath: str) -> Dict[str, str]:
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath is required")
    t = _tool()
    return {"report": t.financial_forensics(filepath)}

