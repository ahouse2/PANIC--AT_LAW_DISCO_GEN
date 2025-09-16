import React, { useEffect, useRef, useState } from "react";
import { theme } from "../theme";

function MetricCard({ icon, label, value, series, delta }) {
  const [display, setDisplay] = useState(0);
  const sparkRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const to = Number(value) || 0;
    const dur = 800;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t; // easeInOutQuad
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const cvs = sparkRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width = 96; const h = cvs.height = 28;
    ctx.clearRect(0,0,w,h);
    // background grid
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x=0; x<w; x+=12) ctx.fillRect(x, 0, 1, h);
    // build sparkline points: prefer provided series, else synthetic based on value
    let values = Array.isArray(series) && series.length ? series.slice(-24) : null;
    if (!values) {
      values = Array.from({length: 24}, () => Math.max(0, (Number(value)||0) * (0.8 + Math.random()*0.4)));
    }
    const min = Math.min(...values);
    const max = Math.max(...values, 1);
    const norm = (v) => (v - min) / (max - min || 1);
    const pts = values.map((v,i) => ({ x: (i/(values.length-1))*w, y: h - (h*0.15 + (h*0.7)*norm(v)) }));
    ctx.beginPath();
    pts.forEach((p,i)=> i? ctx.lineTo(p.x,p.y): ctx.moveTo(p.x,p.y));
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0, '#45F2FF'); grad.addColorStop(1, '#98FF32');
    ctx.strokeStyle = grad; ctx.shadowColor = 'rgba(69,242,255,0.5)'; ctx.shadowBlur = 6; ctx.lineWidth = 2; ctx.stroke();
  }, [value, display, series]);

  return (
    <div className="metric-card glass glow-pulse" style={{ padding: 8, borderRadius: 10 }}>
      <i className={`fa ${icon} text-xl mb-1`} style={{ color: theme.colors.accent }} aria-hidden="true"></i>
      <div className="flex items-center gap-2">
        <span className="value" aria-label={label+': '+display}>{display}</span>
        {typeof delta === 'number' && (
          <span className={`text-xs ${delta>0? 'text-green-300':'text-red-300'}`} title="delta">
            <i className={`fa ${delta>0? 'fa-arrow-up':'fa-arrow-down'} mr-1`}></i>
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <span className="label">{label}</span>
      <canvas ref={sparkRef} aria-hidden="true" style={{ width: 96, height: 28, marginTop: 4 }} />
    </div>
  );
}

export default MetricCard;
