import React, { useEffect, useRef, useState } from "react";
import { theme } from "../theme";

function MetricCard({ icon, label, value }) {
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
    // simple synthetic sparkline based on value
    const pts = Array.from({length: 24}, (_,i) => ({ x: (i/(24-1))*w, y: h - (h*0.2 + (h*0.6)*(0.3 + 0.7*Math.random())) }));
    ctx.beginPath();
    pts.forEach((p,i)=> i? ctx.lineTo(p.x,p.y): ctx.moveTo(p.x,p.y));
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0, '#45F2FF'); grad.addColorStop(1, '#98FF32');
    ctx.strokeStyle = grad; ctx.shadowColor = 'rgba(69,242,255,0.5)'; ctx.shadowBlur = 6; ctx.lineWidth = 2; ctx.stroke();
  }, [value, display]);

  return (
    <div className="metric-card glass glow-pulse" style={{ padding: 8, borderRadius: 10 }}>
      <i className={`fa ${icon} text-xl mb-1`} style={{ color: theme.colors.accent }} aria-hidden="true"></i>
      <span className="value" aria-label={label+': '+display}>{display}</span>
      <span className="label">{label}</span>
      <canvas ref={sparkRef} aria-hidden="true" style={{ width: 96, height: 28, marginTop: 4 }} />
    </div>
  );
}

export default MetricCard;
