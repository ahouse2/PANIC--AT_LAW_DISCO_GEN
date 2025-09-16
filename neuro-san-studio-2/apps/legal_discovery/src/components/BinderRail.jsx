import React, { useEffect, useState } from 'react';

export default function BinderRail(){
  const [jobs, setJobs] = useState([]);
  const [caseId, setCaseId] = useState('1');

  const enqueue = async () => {
    const r = await fetch('/api/binder/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ case_id: caseId }) });
    const j = await r.json();
    if (j.job_id) setJobs(prev => [...prev, { id: j.job_id, status: 'queued' }]);
  };

  useEffect(() => {
    const t = setInterval(async () => {
      if (!jobs.length) return;
      const next = await Promise.all(jobs.map(async (job) => {
        if (job.status === 'finished' || job.status === 'unknown') return job;
        try {
          const r = await fetch(`/api/tasks/${job.id}`); const j = await r.json();
          return { ...job, status: j.status, result: j.result };
        } catch { return job; }
      }));
      setJobs(next);
    }, 1500);
    return () => clearInterval(t);
  }, [jobs]);

  return (
    <div className="glass section">
      <div className="title">Binder Jobs</div>
      <div className="flex items-center gap-2 mt-2">
        <input className="w-24 p-1 rounded bg-gray-900 text-gray-100" value={caseId} onChange={e=>setCaseId(e.target.value)} placeholder="case" />
        <button className="btn-neon" onClick={enqueue}>Create Binder</button>
      </div>
      <ul className="mt-2 text-xs trace-list" style={{maxHeight: 160, overflowY:'auto'}}>
        {jobs.map(j => (
          <li key={j.id} className="trace-chip">
            <span>{j.id.slice(0,8)}</span>
            <span>{j.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

