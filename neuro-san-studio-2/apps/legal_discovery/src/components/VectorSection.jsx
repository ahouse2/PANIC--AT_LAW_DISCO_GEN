import React, { useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import Spinner from "./common/Spinner";
import ErrorBanner from "./common/ErrorBanner";

function VectorSection() {
  const [q,setQ] = useState('');
  const [caseId,setCaseId] = useState('1');
  const [n,setN] = useState(5);
  const [results,setResults] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const search = () => {
    setLoading(true);
    setError(null);
    const url = `/api/vector/search?q=${encodeURIComponent(q)}&case_id=${encodeURIComponent(caseId||'1')}&n_results=${n}`;
    fetch(url)
      .then(r=>r.json())
      .then(d=>{
        const data=(d && d.result) || {};
        const docs=(data.documents && data.documents[0])||[];
        const ids=(data.ids && data.ids[0])||[];
        const items=docs.map((t,i)=>({id:ids[i]||i,text:t}));
        setResults(items);
      })
      .catch(e=>setError(e.message || 'Search failed'))
      .finally(()=>setLoading(false));
  };
  return (
    <ErrorBoundary>
      <section className="card glass">
        <h2>Vector Search</h2>
        <div className="flex gap-2 mb-2">
          <input type="text" value={q} onChange={e=>setQ(e.target.value)} className="flex-1 p-2 rounded bg-gray-900 text-gray-100" placeholder="Search text" />
          <input type="text" value={caseId} onChange={e=>setCaseId(e.target.value)} className="w-28 p-2 rounded bg-gray-900 text-gray-100" placeholder="case_id" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-400">n_results</label>
          <input type="range" min="1" max="20" value={n} onChange={e=>setN(parseInt(e.target.value))} />
          <span className="text-xs">{n}</span>
        </div>
        <button className="button-secondary mb-2" onClick={search}><i className="fa fa-search mr-1"></i>Search</button>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        <ul className="text-sm list-disc list-inside">
          {results.map((r,i)=>(<li key={i}><strong>{r.id}:</strong> {r.text}</li>))}
        </ul>
      </section>
    </ErrorBoundary>
  );
}
export default VectorSection;
