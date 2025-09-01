// Graph3D.jsx
// Готовая 3D-визуализация с защитой от undefined links и без "частиц"
import axios from "../api/axiosInstance";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

// Нормализация формата ответа (чтобы никогда не было undefined/null)
function normalizeGraph(raw) {
  const nodes = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const linksRaw =
    Array.isArray(raw?.links) ? raw.links :
      Array.isArray(raw?.edges) ? raw.edges : [];

  const links = linksRaw
    .filter(l => l && (l.source ?? l.src ?? l.from) != null && (l.target ?? l.tgt ?? l.to) != null)
    .map(l => ({
      source: l.source ?? l.src ?? l.from,
      target: l.target ?? l.tgt ?? l.to,
      label: l.label,
      ...l
    }));

  return { nodes, links };
}

const Graph3D = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [mode, setMode] = useState('schema');
  const [loading, setLoading] = useState(false);
  const fgRef = useRef(null);

  const fetchGraph = useCallback(async (selectedMode) => {
    setLoading(true);
    try {
      const resp = await axios.get(`visual/api/graph?mode=${encodeURIComponent(selectedMode)}`);
      // if (!resp.ok) {
      //   console.error('Graph API not ok:', resp.status, resp.statusText);
      //   setGraphData({ nodes: [], links: [] });
      //   return;
      // }
      console.log(resp);
      const raw = await resp.data;
      const safe = normalizeGraph(raw);
      setGraphData(safe);
    } catch (err) {
      console.error('Failed to fetch graph data', err);
      setGraphData({ nodes: [], links: [] }); // аварийный дефолт
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph(mode);
  }, [mode, fetchGraph]);

  // Цвета для узлов (таблицы в schema — единым цветом, записи — по таблице)
  const nodeColor = (node) => {
    if (mode === 'schema') return '#4F46E5';
    let hash = 0;
    const str = node.table || node.id;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  };

  // Безопасный объект для графа (на случай пере-рендеров)
  const safeGraph = {
    nodes: Array.isArray(graphData?.nodes) ? graphData.nodes : [],
    links: Array.isArray(graphData?.links) ? graphData.links : []
  };

  return (
    <div style={{ width: '100%', height: '80%', position: 'relative' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <button
          onClick={() => setMode('schema')}
          style={{
            marginRight: '0.5rem',
            padding: '0.5rem 1rem',
            background: mode === 'schema' ? '#6366F1' : '#E5E7EB',
            color: mode === 'schema' ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Schema Mode
        </button>
        <button
          onClick={() => setMode('data')}
          style={{
            padding: '0.5rem 1rem',
            background: mode === 'data' ? '#6366F1' : '#E5E7EB',
            color: mode === 'data' ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Data Mode
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading graph...</div>
      ) : (
        <ForceGraph3D
          ref={fgRef}
          width="100%"
          height="80%"
          graphData={safeGraph}
          // ВАЖНО: не задаём linkDirectionalParticles / Speed,
          // чтобы не трогать updatePhotons внутри либы.
          nodeColor={nodeColor}
          linkColor={() => '#9CA3AF'}
          linkOpacity={0.4}
          nodeLabel={node =>
            mode === 'schema'
              ? node.id
              : `${node.table}\n${JSON.stringify(node.data)}`
          }
          linkLabel={link => link.label}
          onNodeClick={node => {
            const distance = 40;
            const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
            fgRef.current?.cameraPosition(
              { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
              node,
              3000
            );
          }}
          backgroundColor={'#111827'}
        />
      )}
    </div>
  );
};

export default Graph3D;
