import React, { useState, useEffect } from "react";
import { alertResponse } from "../utils";

function AutoDraftSection() {
  const [types, setTypes] = useState([]);
  const [motion, setMotion] = useState("");
  const [draft, setDraft] = useState("");
  const [output, setOutput] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/drafting/available").then(r => r.json()).then(d => setTypes((d && d.result && d.result.motions) || []));
  }, []);

  const generate = () => {
    if (!motion) return;
    fetch("/api/drafting/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motion_type: motion })
    }).then(r => r.json()).then(d => { const content=(d && d.result && d.result.content) || ''; setDraft(content); setReviewed(false); alertResponse(d); });
  };

  const exportFile = fmt => {
    if (!draft || !reviewed) return;
    fetch("/api/drafting/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft, file_path: `uploads/drafts/${motion || 'draft'}.${fmt}`, fmt })
    }).then(r => r.json()).then(d => {
      alertResponse(d);
      const out=(d && d.result && d.result.path) || '';
      if (out) { setOutput(out); try { window.open(out.startsWith('/uploads')? out : ('/'+out), "_blank"); } catch {} }
    });
  };

  const seedFromTheory = async () => {
    setSeeding(true);
    try {
      const r = await fetch('/api/theories/suggest');
      const j = await r.json();
      const theories = (j && j.theories) || [];
      const accepted = theories.filter(t => t.status === 'approved');
      if (!accepted.length) return;
      const seed = accepted.map(t => {
        const els = (t.elements||[]).map(e => `- ${e.name} (${Math.round((e.weight||0)*100)}%)`).join('\n');
        return `Cause: ${t.cause} [${Math.round((t.score||0)*100)}%]\nElements:\n${els}`;
      }).join('\n\n');
      const header = 'SEED: Accepted Theories and Elements\n';
      setDraft(d => (d ? (header + seed + '\n\n' + d) : (header + seed)));
      setReviewed(false);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section className="card glass floaty">
      <h2>Auto Draft</h2>
      <div className="animated-border mb-2" />
      <select value={motion} onChange={e=>setMotion(e.target.value)} className="p-2 rounded w-full mb-2">
        <option value="">Select Motion Type</option>
        {types.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
      </select>
      <div className="flex flex-wrap gap-2 mb-2">
        <button className="button-secondary" onClick={generate} disabled={!motion}><i className="fa fa-magic mr-1"></i>Generate</button>
        <button className="button-secondary" onClick={() => { setDraft(""); setReviewed(false); }}><i className="fa fa-eraser mr-1"></i>Clear</button>
        <button className="button-secondary" onClick={seedFromTheory} disabled={seeding}><i className="fa fa-seedling mr-1"></i>Seed from Theory</button>
        <button className="button-secondary" onClick={() => setReviewed(true)} disabled={!draft}><i className="fa fa-check mr-1"></i>Mark Reviewed</button>
        <button className="button-secondary" onClick={() => exportFile('docx')} disabled={!reviewed}><i className="fa fa-file-word mr-1"></i>Export DOCX</button>
        <button className="button-secondary" onClick={() => exportFile('pdf')} disabled={!reviewed}><i className="fa fa-file-pdf mr-1"></i>Export PDF</button>
      </div>
      <p className="text-sm mb-1">{reviewed ? "Draft reviewed" : "Review required before export"}</p>
      <textarea
        rows="10"
        value={draft}
        onChange={e=>{ setDraft(e.target.value); setReviewed(false); }}
        className={`w-full p-2 rounded border ${reviewed ? 'border-green-500' : 'border-red-500'}`}
        placeholder="Draft output for review..."
      />
      {output && <p className="text-sm">Output: <a href={'/uploads/'+output} target="_blank" rel="noopener noreferrer">{output}</a></p>}
    </section>
  );
}

export default AutoDraftSection;
