import os
from flask import Blueprint, jsonify, request

from coded_tools.legal_discovery.pretrial_generator import PretrialGenerator
from .tasks import enqueue, binder_task

binder_bp = Blueprint("binder", __name__, url_prefix="/api/binder")


@binder_bp.post("/pretrial/export")
def export_pretrial_statement():
    """Generate a pretrial statement document and update timeline/binder."""

    data = request.get_json() or {}
    case_id = data.get("case_id")
    try:
        case_id = int(case_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Missing case_id"}), 400

    os.makedirs("exports", exist_ok=True)
    path = os.path.join("exports", f"pretrial_{case_id}.docx")
    generator = PretrialGenerator()
    generator.export(case_id, path)
    return jsonify({"status": "ok", "path": path})


@binder_bp.post("/create")
def create_binder_job():
    """Enqueue binder generation for a case and return a task id."""
    data = request.get_json() or {}
    case_id = data.get("case_id")
    try:
        case_id = int(case_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Missing case_id"}), 400
    job_id, result = enqueue(binder_task, case_id)
    return jsonify({"status": "ok", "job_id": job_id, "result": result})


__all__ = ["binder_bp"]
