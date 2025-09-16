import React, { useEffect, useRef, useState } from 'react';

export default function TrialHUD(){
  const [open, setOpen] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='t') setOpen(v=>!v); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!startTs) return; let raf;
    const tick = () => { setElapsed(Math.floor((Date.now() - startTs)/1000)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [startTs]);
  if (!open) return null;
  const mm = String(Math.floor(elapsed/60)).padStart(2,'0'); const ss = String(elapsed%60).padStart(2,'0');
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:60 }}>
      <div className="glass neon-border" style={{ position:'absolute', right:12, top:12, pointerEvents:'auto', padding:12, width:280 }}>
        <div className="title">Trial HUD</div>
        <div className="text-center text-2xl my-2">{mm}:{ss}</div>
        <div className="flex gap-2">
          <button className="btn-neon" onClick={()=>setStartTs(Date.now())}>Start</button>
          <button className="button-secondary" onClick={()=>{ setStartTs(null); setElapsed(0); }}>Reset</button>
        </div>
        <div className="animated-border mt-2" />
        <div className="text-xs text-gray-300 mt-2">Press Ctrl/Cmd + T to toggle</div>
      </div>
    </div>
  );
}

