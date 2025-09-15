import time
import json
import os
from typing import Any, Callable, Dict

from flask import Blueprint, jsonify, request
from .extensions import limiter, socketio


agents_bp = Blueprint("agents", __name__, url_prefix="/api/agents")


# Allowlist: tool name → callable import path (resolved at runtime)
_TOOL_REGISTRY: Dict[str, Callable[..., Any]] | None = None


def _load_tools() -> Dict[str, Callable[..., Any]]:
    global _TOOL_REGISTRY
    if _TOOL_REGISTRY is not None:
        return _TOOL_REGISTRY
    # Imports rely on PYTHONPATH including /usr/src/panic (set in compose)
    from panic_core.mcp import (
        mcp_document_processor,
        mcp_fact_extractor,
        mcp_vector_database,
        mcp_knowledge_graph,
        mcp_drafting,
    )

    _TOOL_REGISTRY = {
        "mcp_document_processor.extract": mcp_document_processor.extract,
        "mcp_fact_extractor.extract": mcp_fact_extractor.extract,
        "mcp_vector.add_documents": mcp_vector_database.add_documents,
        "mcp_vector.query": mcp_vector_database.query,
        "mcp_vector.count": mcp_vector_database.count,
        "mcp_graph.upsert_document": mcp_knowledge_graph.upsert_document,
        "mcp_graph.add_fact": mcp_knowledge_graph.add_fact,
        "mcp_graph.link_fact_to_element": mcp_knowledge_graph.link_fact_to_element,
        "mcp_drafting.available": mcp_drafting.available,
        "mcp_drafting.generate": mcp_drafting.generate,
        "mcp_drafting.export": mcp_drafting.export,
    }
    return _TOOL_REGISTRY


@agents_bp.post("/run_tool")
@limiter.exempt
def run_tool():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        try:
            import json as _json

            data = _json.loads(request.data.decode("utf-8") or "{}")
        except Exception:
            data = {}
    name = data.get("tool") if isinstance(data, dict) else None
    args = data.get("args", {}) if isinstance(data, dict) else {}
    # Fallback to query params for robustness in diverse clients
    if not name:
        name = request.args.get("tool") or request.values.get("tool")
    if not args and request.args.get("args"):
        try:
            import json as _json

            args = _json.loads(request.args.get("args"))
        except Exception:
            args = {}
    if not isinstance(name, str) or not name:
        return jsonify({"ok": False, "error": "tool is required"}), 400
    tools = _load_tools()
    func = tools.get(name)
    if func is None:
        return jsonify({"ok": False, "error": "tool not allowed"}), 403

    start = time.perf_counter()
    try:
        result = func(**args) if isinstance(args, dict) else func(args)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        return jsonify({"ok": True, "tool": name, "result": result, "timing_ms": elapsed_ms})
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        return (
            jsonify({"ok": False, "tool": name, "error": str(exc), "timing_ms": elapsed_ms}),
            500,
        )


@agents_bp.get("/debug_echo")
@limiter.exempt
def debug_echo():
    try:
        args = request.args.to_dict(flat=True)
        values = request.values.to_dict(flat=True)
        data = request.data.decode("utf-8")
        return jsonify({"args": args, "values": values, "data": data})
    except Exception as exc:
        return ("ERR:" + str(exc), 500, {"Content-Type": "text/plain"})


@agents_bp.get("/ping")
@limiter.exempt
def ping():
    return jsonify({"ok": True, "pong": True})


@agents_bp.post("/orchestrate")
@limiter.exempt
def orchestrate():
    """Lightweight orchestrator endpoint with timing logs and socket emission.

    Notes:
    - Uses AG2 scaffold when available, otherwise falls back to direct MCP tool routing.
    - Returns response-only body with per-tool timings.
    """
    data = request.get_json(silent=True) or {}
    message = data.get("message") or data.get("text") or ""
    case_id = data.get("case_id")
    trace_id = data.get("trace_id")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "message is required"}), 400

    tools_ran: list[dict] = []
    response_text = ""

    # Try AG2 orchestrator if available.
    used_ag2 = False
    try:
        from panic_core.agents.ag2_registry_loader import make_orchestrator

        orchestrator, group = make_orchestrator(os.environ.get("AGENT_MANIFEST_FILE"))
        # Minimal single-turn flow: let orchestrator respond directly.
        # Some AG2 versions expect a manager to run the groupchat; we guard with try/except.
        start = time.perf_counter()
        try:
            result = orchestrator.generate_reply(messages=[{"role": "user", "content": message}], max_turns=1)
            response_text = result.get("content") if isinstance(result, dict) else str(result)
        except Exception:
            # Fallback to a function-less message pass if generate_reply is unavailable.
            response_text = f"Received: {message}"
        tools_ran.append({"name": "ag2_orchestrator", "duration_ms": round((time.perf_counter() - start) * 1000, 2)})
        used_ag2 = True
    except Exception:
        used_ag2 = False

    # Tool routing fallback or augmentation based on message intent.
    if not used_ag2:
        tools = _load_tools()
        lower = message.lower()
        # Drafting intent
        if any(k in lower for k in ["rfo", "responsive declaration", "declaration", "move-away", "move away"]):
            start = time.perf_counter()
            res = tools["mcp_drafting.generate"](motion_type="Responsive Declaration to RFO (Move-Away)")
            response_text = res.get("content", "") if isinstance(res, dict) else str(res)
            tools_ran.append({"name": "mcp_drafting.generate", "duration_ms": round((time.perf_counter() - start) * 1000, 2)})
        # Vector query intent
        elif any(k in lower for k in ["search", "vector", "find", "retrieve"]):
            start = time.perf_counter()
            res = tools["mcp_vector.query"](q=message, n_results=5, where={"case_id": case_id} if case_id else None, case_id=case_id)
            response_text = json.dumps(res)
            tools_ran.append({"name": "mcp_vector.query", "duration_ms": round((time.perf_counter() - start) * 1000, 2)})
        else:
            # Default to echo with timing to keep contract stable
            start = time.perf_counter()
            response_text = f"ok: {message}"
            tools_ran.append({"name": "noop", "duration_ms": round((time.perf_counter() - start) * 1000, 2)})

    # Emit to UI via sockets for live feedback
    try:
        socketio.emit("agent_response", {"trace_id": trace_id, "data": response_text}, namespace="/chat")
    except Exception:
        pass

    total_ms = 0.0
    try:
        total_ms = sum(t.get("duration_ms", 0) for t in tools_ran)
    except Exception:
        total_ms = 0.0
    return jsonify({
        "response": response_text,
        "tools": tools_ran,
        "timings": {"total_ms": round(total_ms, 2)},
    })
