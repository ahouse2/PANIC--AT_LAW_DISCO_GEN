import React, { useEffect, useState } from 'react';

export default function ObjectionOverlay(){
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'o' && (e.ctrlKey || e.metaKey)) setOpen(v=>!v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  const quick = async (type) => {
    try{
      await fetch('/api/objections/raise', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type }) });
    } catch {}
  };

  const items = ['Relevance','Hearsay','Speculation','Leading','Foundation','Argumentative'];

  return (
    <div style={{position:'fixed', inset:0, zIndex:50, display:'grid', placeItems:'center', pointerEvents:'none'}}>
      <div className="glass neon-border glow-pulse" style={{pointerEvents:'auto', width:'80%', maxWidth:900, padding:16}}>
        <div className="flex items-center justify-between mb-2">
          <div className="title">Live Objection Assistant</div>
          <button className="btn-neon" onClick={()=>setOpen(false)}>Close</button>
        </div>
        <div className="grid-cards">
          {items.map(it => (
            <button key={it} className="button-secondary" onClick={()=>quick(it)}>{it}</button>
          ))}
        </div>
        <div className="animated-border mt-2" />
        <p className="text-xs text-gray-300 mt-2">Tip: Press Ctrl/Cmd + O to toggle.</p>
      </div>
    </div>
  );
}

