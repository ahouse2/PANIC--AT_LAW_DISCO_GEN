"""MCP wrapper for drafting motions using AutoDrafter and TemplateLibrary.

Contracts
- name: mcp_drafting.available
  args: {}
  returns: { motions: [str] }

- name: mcp_drafting.generate
  args: { motion_type: str, temperature?: float }
  returns: { content: str }

- name: mcp_drafting.export
  args: { content: str, file_path: str, fmt?: str }
  returns: { path: str }
"""

from __future__ import annotations

from typing import Any, Dict, List


def _drafter():
    try:
        from coded_tools.legal_discovery.auto_drafter import AutoDrafter
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("coded_tools not available on PYTHONPATH") from exc
    return AutoDrafter()


def available() -> Dict[str, List[str]]:
    try:
        from coded_tools.legal_discovery.template_library import TemplateLibrary
        return {"motions": TemplateLibrary().available()}
    except Exception:
        # Minimal fallback if templates cannot be imported
        return {"motions": []}


def generate(motion_type: str, temperature: float | None = None) -> Dict[str, Any]:
    if not isinstance(motion_type, str) or not motion_type:
        raise ValueError("motion_type is required")
    drafter = _drafter()
    content = drafter.generate(motion_type=motion_type, temperature=temperature)
    return {"content": content}


def export(content: str, file_path: str, fmt: str | None = None) -> Dict[str, str]:
    if not isinstance(content, str) or not content:
        raise ValueError("content is required")
    if not isinstance(file_path, str) or not file_path:
        raise ValueError("file_path is required")
    drafter = _drafter()
    path = drafter.export(content=content, file_path=file_path, fmt=fmt)
    return {"path": path}

