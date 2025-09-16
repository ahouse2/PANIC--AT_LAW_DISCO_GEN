import React, { useState, useEffect, useRef } from "react";
import { fetchJSON } from "../utils";
import MetricCard from "./MetricCard";
function OverviewSection() {
  const [metrics,setMetrics] = useState({});
  const seriesRef = useRef({});
  const [tick,setTick] = useState(0);
  const refresh = async () => {
    try {
      const d = await fetchJSON('/api/metrics');
      const data = d.data || {};
      setMetrics(data);
      // append to series history
      const keys = ['uploaded_files','task_count','vector_docs','graph_nodes','case_count'];
      keys.forEach(k => {
        const v = Number(data[k]||0);
        if (!seriesRef.current[k]) seriesRef.current[k] = [];
        seriesRef.current[k].push(v);
        if (seriesRef.current[k].length > 48) seriesRef.current[k].shift();
      });
      setTick(x=>x+1);
    } catch {}
  };
  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, []);
  const hitRate = (() => {
    const hits = metrics.cache_hits || 0;
    const misses = metrics.cache_misses || 0;
    const total = hits + misses;
    return total ? Math.round((hits * 100) / total) : 0;
  })();
  return (
    <section className="card glass floaty">
      <h2>Overview</h2>
      <div className="animated-border mb-2" />
        <div className="metrics-grid">
          <MetricCard icon="fa-briefcase" label="Cases" value={metrics.case_count||0} series={seriesRef.current['case_count']} />
          <MetricCard icon="fa-file-alt" label="Files" value={metrics.uploaded_files||0} series={seriesRef.current['uploaded_files']} />
          <MetricCard icon="fa-tasks" label="Tasks" value={metrics.task_count||0} series={seriesRef.current['task_count']} />
          <MetricCard icon="fa-database" label="Vectors" value={metrics.vector_docs||0} series={seriesRef.current['vector_docs']} />
          <MetricCard icon="fa-project-diagram" label="Graph" value={metrics.graph_nodes||0} series={seriesRef.current['graph_nodes']} />
          <MetricCard icon="fa-bolt" label="Cache Hit %" value={hitRate} />
        </div>
      <button className="button-secondary" onClick={refresh}><i className="fa fa-sync mr-1"></i>Refresh</button>
    </section>
  );
}
export default OverviewSection;
