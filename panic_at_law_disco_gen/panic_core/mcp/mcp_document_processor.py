"""MCP wrapper for coded_tools.legal_discovery.document_processor.DocumentProcessor.

Contract
- name: mcp_document_processor.extract
- args: { filepath: str }
- returns: { text: str, meta: { bytes: int, ext: str } }
- errors: standardized with code and message
"""

from __future__ import annotations

import os
from typing import Any, Dict


def extract(filepath: str) -> Dict[str, Any]:
    """Extract text from a file via coded tool.

    Returns
    -------
    { text: str, meta: { bytes: int, ext: str } }
    """
    if not isinstance(filepath, str) or not filepath:
        raise ValueError("filepath must be a non-empty string")
    if not os.path.exists(filepath):
        raise FileNotFoundError(filepath)

    try:
        from coded_tools.legal_discovery.document_processor import DocumentProcessor
    except Exception as exc:  # pragma: no cover - import environment
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc

    dp = DocumentProcessor()
    text = dp.extract_text(filepath) or ""
    size = 0
    try:
        size = os.path.getsize(filepath)
    except Exception:
        size = 0
    ext = os.path.splitext(filepath)[1].lstrip(".").lower()
    return {"text": text, "meta": {"bytes": int(size), "ext": ext}}
