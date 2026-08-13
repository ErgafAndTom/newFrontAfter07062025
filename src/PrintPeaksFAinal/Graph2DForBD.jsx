// Graph2D_with_comments.jsx
// 2D версия ForceGraph с сохранением логики взаимосвязей, подсветок, группировок и проекций

import axios from "../api/axiosInstance";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import TableManager from "./dataMenager/TableManager";
import ExportImportComponent from "./dataMenager/ExportImportComponent";
import Loader from "../components/calc/Loader";
import SpriteText from "three-spritetext";
import Laminator from "./poslugi/Laminator";
import "./Graph2DForBD.css";

// Полотно графа — canvas, тож колір потрібен рядком (CSS-змінну він не читає).
// Той самий тон продубльовано в --g2d-canvas-bg у Graph2DForBD.css.
const CANVAS_BG = "#000422";

// ---------- нормализация ----------
function normalizeGraph(raw) {
  const nodesRaw = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const linksRaw = Array.isArray(raw?.links)
    ? raw.links
    : Array.isArray(raw?.edges)
      ? raw.edges
      : [];

  const nodes = nodesRaw.map((n, i) => {
    const id = n.id ?? n.ID ?? n.key ?? n.name ?? n.title ?? n.uuid ?? n._id ?? String(i);
    return { id, ...n };
  });

  const links = linksRaw
    .filter((l) => (l.source ?? l.src ?? l.from) != null && (l.target ?? l.tgt ?? l.to) != null)
    .map((l) => ({
      source: l.source ?? l.src ?? l.from,
      target: l.target ?? l.tgt ?? l.to,
      label: l.label,
      ...l,
    }));

  return { nodes, links };
}

// ---------- вспомогательные функции ----------
function groupByField(nodes, key) {
  if (!key || key === "none") return new Map([["__all__", nodes]]);
  const map = new Map();
  for (const n of nodes) {
    const g = n[key] ?? "__undefined__";
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(n);
  }
  return map;
}

function gridPositions(count, gap) {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const coords = [];
  const w = (cols - 1) * gap;
  const h = (rows - 1) * gap;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= count) break;
      coords.push({ x: -w / 2 + c * gap, y: -h / 2 + r * gap });
    }
  }
  return coords;
}

function apply2DProjectionWithGrouping(graph, { groupKey = "table", clusterSpacing = 260, nodeRingRadius = 90 } = {}) {
  graph.nodes.forEach((n) => {
    n.fx = n.fy = undefined;
  });

  const groups = groupByField(graph.nodes, groupKey);
  const clusterCenters = gridPositions(groups.size, clusterSpacing);
  const entries = Array.from(groups.entries());

  entries.forEach(([groupName, nodes], idx) => {
    const center = clusterCenters[idx] ?? { x: 0, y: 0 };
    const n = nodes.length || 1;
    const r = Math.max(40, nodeRingRadius);
    nodes.forEach((node, i) => {
      const a = (2 * Math.PI * i) / n;
      node.fx = center.x + r * Math.cos(a);
      node.fy = center.y + r * Math.sin(a);
    });
  });
}

// ---------- основной компонент ----------
const Graph2DForBD = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [mode, setMode] = useState("schema");
  const [loading, setLoading] = useState(false);
  const [groupField, setGroupField] = useState("table");
  const [clusterGap, setClusterGap] = useState(260);
  const [inClusterRadius, setInClusterRadius] = useState(90);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const fgRef = useRef();
  const containerRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const [hoverNode, setHoverNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // авторазмер
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setDims({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setDims({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    return () => ro.disconnect();
  }, []);

  // загрузка графа
  const fetchGraph = useCallback(async (selectedMode) => {
    setLoading(true);
    try {
      const resp = await axios.get(`visual/api/graph?mode=${encodeURIComponent(selectedMode)}`);
      const raw = resp.data;
      const safe = normalizeGraph(raw);
      setGraphData(safe);
    } catch (err) {
      console.error("Failed to fetch graph data", err);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph(mode);
  }, [mode, fetchGraph]);

  // hover подсветка
  const neighborMap = useMemo(() => {
    const nmap = new Map();
    for (const l of graphData.links || []) {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      if (s == null || t == null) continue;
      if (!nmap.has(s)) nmap.set(s, new Set());
      if (!nmap.has(t)) nmap.set(t, new Set());
      nmap.get(s).add(t);
      nmap.get(t).add(s);
    }
    return nmap;
  }, [graphData]);

  const isNodeHighlighted = useCallback(
    (node) => {
      if (!hoverNode && !hoverLink) return false;
      if (hoverNode) {
        const id = node.id;
        if (id === hoverNode.id) return true;
        const neigh = neighborMap.get(hoverNode.id);
        return neigh ? neigh.has(id) : false;
      }
      if (hoverLink) {
        const sid = typeof hoverLink.source === "object" ? hoverLink.source.id : hoverLink.source;
        const tid = typeof hoverLink.target === "object" ? hoverLink.target.id : hoverLink.target;
        return node.id === sid || node.id === tid;
      }
      return false;
    },
    [hoverNode, hoverLink, neighborMap]
  );

  const isLinkHighlighted = useCallback(
    (link) => {
      if (!hoverNode && !hoverLink) return false;
      const s = typeof link.source === "object" ? link.source.id : link.source;
      const t = typeof link.target === "object" ? link.target.id : link.target;
      if (hoverLink) {
        const hs = typeof hoverLink.source === "object" ? hoverLink.source.id : hoverLink.source;
        const ht = typeof hoverLink.target === "object" ? hoverLink.target.id : hoverLink.target;
        return (s === hs && t === ht) || (s === ht && t === hs);
      }
      if (hoverNode) return s === hoverNode.id || t === hoverNode.id;
      return false;
    },
    [hoverNode, hoverLink]
  );

  // цвет
  function lightenHsl(color, addL = 10) {
    if (color.startsWith("hsl")) {
      const m = color.match(/hsl\\((\\d+),\\s*(\\d+)%\\s*,\\s*(\\d+)%\\)/i);
      if (m) {
        const h = +m[1];
        const s = +m[2];
        const l = Math.min(100, +m[3] + addL);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    return color;
  }

  // const nodeColor = (node) => {
  //   const baseColor = (() => {
  //     if (mode === "schema") return "#4F46E5";
  //     let hash = 0;
  //     const str = node.table || node.id || "";
  //     for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  //     const hue = Math.abs(hash) % 360;
  //     return `hsl(${hue}, 60%, 50%)`;
  //   })();
  //   return isNodeHighlighted(node) ? lightenHsl(baseColor, 15) : baseColor;
  // };

  const nodeColor = (node) => {
    const baseColor = (() => {
      // if (mode === "schema") return "#4F46E5";
      let hash = 0;
      const str = node.table || node.id || "";
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 60%, 50%)`;
    })();
    return isNodeHighlighted(node) ? lightenHsl(baseColor, 15) : baseColor;
  };

  const linkColor = (link) => (isLinkHighlighted(link) ? "#FFC107" : "#9CA3AF");
  const linkWidth = (link) => (isLinkHighlighted(link) ? 2.5 : 1);
  const linkOpacity = (link) => (isLinkHighlighted(link) ? 0.9 : 0.3);

  // выбор узла
  const handleSelectNode = useCallback(
    (node) => {
      if (!node || node.id == null) return;
      setSelectedNode(node);
    },
    []
  );

  // freeze
  const freezeEngine = useCallback(() => {
    graphData.nodes.forEach((n) => {
      n.fx = n.x;
      n.fy = n.y;
    });
    setIsFrozen(true);
  }, [graphData]);

  const releaseEngine = useCallback(() => {
    graphData.nodes.forEach((n) => {
      n.fx = n.fy = undefined;
    });
    setIsFrozen(false);
  }, [graphData]);

  const safeGraph = useMemo(
    () => ({
      nodes: Array.isArray(graphData?.nodes) ? graphData.nodes : [],
      links: Array.isArray(graphData?.links) ? graphData.links : [],
    }),
    [graphData]
  );

  const getDiagramLabel = (node) => {
    if (mode === "schema") return String(node.id ?? "");
    const title = node.title || node.name || node.id;
    const table = node.table ? `[${node.table}]` : "";
    return `${title ?? ""} ${table}`.trim();
  };

  // прорисовка
  return (
    <div className="g2d-wrap">

      {/* ── Рядок 1: керування графом ── */}
      <div className="g2d-bar">
        <span className="g2d-eyebrow">Режим</span>
        <div className="g2d-seg">
          <button
            className={`ppButton ppButton--sm ${mode === "schema" ? "active" : ""}`}
            aria-pressed={mode === "schema"}
            onClick={() => setMode("schema")}
          >
            <span>Схема</span>
          </button>
          <button
            className={`ppButton ppButton--sm ${mode === "data" ? "active" : ""}`}
            aria-pressed={mode === "data"}
            onClick={() => setMode("data")}
          >
            <span>Дані</span>
          </button>
        </div>

        <span className="g2d-div" />

        <label className="g2d-group">
          <span className="g2d-eyebrow">Групувати за</span>
          <input className="g2d-inp" value={groupField} onChange={(e) => setGroupField(e.target.value)} />
        </label>

        <label className="g2d-group">
          <span className="g2d-eyebrow">Відстань кластерів</span>
          <input className="g2d-range" type="range" min="120" max="520" value={clusterGap} onChange={(e) => setClusterGap(+e.target.value)} />
          <span className="g2d-val">{clusterGap}</span>
        </label>

        <label className="g2d-group">
          <span className="g2d-eyebrow">Радіус у кластері</span>
          <input className="g2d-range" type="range" min="40" max="240" value={inClusterRadius} onChange={(e) => setInClusterRadius(+e.target.value)} />
          <span className="g2d-val">{inClusterRadius}</span>
        </label>

        <span className="g2d-spacer" />

        <button
          className="ppButton ppButton--sm"
          onClick={() => { apply2DProjectionWithGrouping(graphData, { groupKey: groupField, clusterSpacing: clusterGap, nodeRingRadius: inClusterRadius }); fgRef.current?.d3ReheatSimulation(); }}
        >
          <span>Розкласти</span>
        </button>

        {!isFrozen
          ? <button className="ppButton ppButton--sm" onClick={freezeEngine}><span>Зупинити</span></button>
          : <button className="ppButton ppButton--sm active" onClick={releaseEngine}><span>Відновити</span></button>
        }

        <button
          className={`ppButton ppButton--sm ${showLabels ? "active" : ""}`}
          aria-pressed={showLabels}
          onClick={() => setShowLabels(v => !v)}
        >
          <span>{showLabels ? "Підписи ✓" : "Підписи"}</span>
        </button>
      </div>

      {/* ── Рядок 2: обмін даними й автобекап ── */}
      <ExportImportComponent/>

      {/* ── Рядок 3: полотно графу (займає всю решту висоти) ── */}
      <div ref={containerRef} className="g2d-canvas">
        {loading ? (
          <div className="g2d-loading">
            <Loader/>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dims.width}
            height={dims.height}
            graphData={safeGraph}
            // nodeRelSize={5}
            linkColor={linkColor}
            linkWidth={linkWidth}
            linkOpacity={linkOpacity}
            linkCanvasObjectMode={() => "after"}
            nodeColor={nodeColor}
            linkLabel={(link) => link.label}
            nodeLabel={(node) =>
              mode === "schema"
                ? String(node.id ?? "")
                : `${node.table ?? ""}\n${JSON.stringify(node.data ?? {}, null, 2)}`
            }
            onNodeHover={setHoverNode}
            onLinkHover={setHoverLink}
            onNodeClick={handleSelectNode}
            cooldownTicks={isFrozen ? 0 : 80}
            backgroundColor={CANVAS_BG}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = 5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.fillStyle = nodeColor(node);
              ctx.fill();

              if (showLabels) {
                const label = getDiagramLabel(node);
                // canvas не розуміє vw — з ним підпис мовчки падав на дефолтний
                // розмір; ділення на globalScale тримає підпис ~11px на екрані
                // незалежно від зуму
                const fontSize = 11 / globalScale;
                ctx.font = `${fontSize}px "Segoe UI", sans-serif`;
                ctx.fillStyle = "#fff";
                ctx.fillText(label, node.x + size + 2, node.y + fontSize / 3);
              }
            }}
            style={{ backgroundColor: CANVAS_BG }}
          />
        )}
      </div>
    </div>
  );
};

export default Graph2DForBD;
