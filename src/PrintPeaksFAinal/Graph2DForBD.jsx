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
    <div ref={containerRef} style={{ width: "100%", height: "95vh", position: "relative" }}>
      {/* Панель инструментов */}

      <div style={{ position: "absolute", zIndex: 2, background: "rgba(77,77,77,0.77)", padding: 0 }}>
        <ExportImportComponent/>
      </div>

      <div style={{ position: "absolute", zIndex: 2, right: "0.01vw", background: "rgba(77,77,77,0.77)", padding: 0 }}>
        <label style={{ margin: 0, color: "#fff", fontSize: "1vw" }}>
          Mode:
          <button style={{
            margin: 0,
            fontSize: "1vw",
            background: mode === "schema" ? "rgb(255,173,0)" : "rgb(255,255,255)",
          }} onClick={() => setMode("schema")}>Schema</button>
          <button style={{
            margin: 0,
            fontSize: "1vw",
            background: mode === "data" ? "rgb(255,173,0)" : "rgb(255,255,255)",
          }} onClick={() => setMode("data")}>Data</button>
        </label>
        <label style={{ margin: 0, color: "#fff", fontSize: "1vw" }}>
          Group:
          <input
            style={{ margin: 0, fontSize: "1vw", width: 100, }}
            value={groupField}
            onChange={(e) => setGroupField(e.target.value)}
          />
        </label>
        <label style={{ margin: 0, color: "#fff", fontSize: "1vw" }}>
          Cluster gap
          <input
            style={{ margin: 0, color: "#fff", fontSize: "1vw", height: "0.3vw" }}
            type="range"
            min="120"
            max="520"
            value={clusterGap}
            onChange={(e) => setClusterGap(+e.target.value)}
          />
        </label>
        <label style={{ margin: 0, color: "#fff", fontSize: "1vw" }}>
          In-cluster R
          <input
            style={{ margin: 0, color: "#fff", fontSize: "1vw", height: "0.3vw" }}
            type="range"
            min="40"
            max="240"
            value={inClusterRadius}
            onChange={(e) => setInClusterRadius(+e.target.value)}
          />
        </label>
        <button
          style={{ margin: 0, fontSize: "1vw" }}
          onClick={() => {
            apply2DProjectionWithGrouping(graphData, {
              groupKey: groupField,
              clusterSpacing: clusterGap,
              nodeRingRadius: inClusterRadius,
            });
            fgRef.current?.d3ReheatSimulation();
          }}
        >
          Apply layout
        </button>
        {!isFrozen ? <button style={{ margin: 0, fontSize: "1vw" }} onClick={freezeEngine}>Freeze</button> : <button style={{ margin: 0, fontSize: "1vw" }} onClick={releaseEngine}>Release</button>}

        <label style={{ margin: 8,
          color: showLabels ? '#d55200' : '#000000',
          fontSize: "1vw",
          boxShadow: showLabels ? '0 0 1vw rgba(255,255,0,0.5)' : 'none',
          background: showLabels ? "rgb(245,255,58)" : "rgb(255,255,255)",
          cursor: "pointer",
        }}>
          {!showLabels &&
            <>labels off</>
          }
          {showLabels &&
            <>labels on</>
          }
          <input
            style={{
              width:'0vw',
              height:'0vw',
              margin: '0'
          }}
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
        </label>
      </div>

      {loading ? (
        <div style={{ height: `95vh`, backgroundColor: "#000000", textAlign: "center", paddingTop: "40vh" }}>
          {/*Loading graph...*/}
          <Loader/>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={safeGraph}
          nodeRelSize={5}
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
          backgroundColor="#000000"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const size = 6;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor(node);
            ctx.fill();

            if (showLabels) {
              const label = getDiagramLabel(node);
              const fontSize = 14 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = "#fff";
              ctx.fillText(label, node.x + 8, node.y + 4);
            }
          }}
          style={{
            backgroundColor: "#000000",
          }}
        />
      )}
    </div>
  );
};

export default Graph2DForBD;
