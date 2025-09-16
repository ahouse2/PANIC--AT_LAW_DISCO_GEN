import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function CommandCenter() {
  const [traces, setTraces] = useState([]);
  const [health, setHealth] = useState({});
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const s = io('/chat');
    s.on('agent_trace', (d) => setTraces((prev) => [...prev, d]));
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/health');
        const j = await r.json();
        setHealth(j.data || {});
      } catch {}
    };
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const run = async () => {
    if (!prompt.trim()) return;
    await fetch('/api/agents/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, trace_id: crypto.randomUUID() }),
    });
  };

  return (
    <aside className="command-rail">
      <div className="glass neon-border section">
        <div className="title">Command Center</div>
        <textarea className="w-full p-2 mt-2 bg-gray-900 text-gray-100 rounded" rows={2} value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="Ask anything… e.g., Draft RFO responsive declaration"/>
        <div className="mt-2">
          <button className="btn-neon" onClick={run}>Run</button>
        </div>
      </div>
      <div className="glass section">
        <div className="title">Health</div>
        <div className="text-xs mt-2">Neo4j: {health.neo4j}</div>
        <div className="text-xs">Qdrant: {health.qdrant}</div>
        <div className="text-xs">Postgres: {health.postgres}</div>
        <div className="text-xs">Redis: {health.redis}</div>
      </div>
      <div className="glass section">
        <div className="title">Agent Trace</div>
        <div className="trace-list mt-2">
          {traces.slice(-40).map((t, i) => (
            <div key={i} className="trace-chip">
              <span>{t.step}{t.tool ? `: ${t.tool}` : ''}</span>
              {typeof t.duration_ms === 'number' && <span>{t.duration_ms} ms</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

