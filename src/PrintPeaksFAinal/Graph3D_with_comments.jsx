// Graph3D_with_comments.jsx
// Физика переключаемая. Любое изменение параметров мгновенно пересчитывает раскладку.

import axios from "../api/axiosInstance";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

// ───────────────────────── helpers ─────────────────────────
function normalizeGraph(raw) {
  const nodesRaw = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const linksRaw = Array.isArray(raw?.links)
    ? raw.links
    : Array.isArray(raw?.edges)
      ? raw.edges
      : [];

  const nodes = nodesRaw.map((n, i) => {
    const id =
      n.id ?? n.ID ?? n.key ?? n.name ?? n.title ?? n.uuid ?? n._id ?? String(i);
    return { id, ...n };
  });

  const links = linksRaw
    .filter((l) => l && (l.source ?? l.src ?? l.from) != null && (l.target ?? l.tgt ?? l.to) != null)
    .map((l) => ({
      source: l.source ?? l.src ?? l.from,
      target: l.target ?? l.tgt ?? l.to,
      label: l.label,
      ...l,
    }));

  return { nodes, links };
}

function buildAdjacency(links) {
  const adj = new Map();
  for (const l of links) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (s == null || t == null) continue;
    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s).add(t);
    adj.get(t).add(s);
  }
  return adj;
}

function bfsLevels(centerId, adj, maxDepth) {
  const levels = new Map();
  const q = [[centerId, 0]];
  levels.set(centerId, 0);
  while (q.length) {
    const [id, d] = q.shift();
    if (d === maxDepth) continue;
    for (const n of adj.get(id) || []) {
      if (!levels.has(n)) {
        levels.set(n, d + 1);
        q.push([n, d + 1]);
      }
    }
  }
  return levels;
}

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
      coords.push({ x: -w / 2 + c * gap, z: -h / 2 + r * gap });
    }
  }
  return coords;
}

// ───────────────────────── layouts ─────────────────────────
function applyRadialLayout(centerNode, graph, depth, gap) {
  if (!centerNode || centerNode.id == null) return;
  const adj = buildAdjacency(graph.links);
  const levels = bfsLevels(centerNode.id, adj, depth);

  const buckets = new Map();
  levels.forEach((d, id) => {
    if (!buckets.has(d)) buckets.set(d, []);
    buckets.get(d).push(id);
  });

  const cx = centerNode.x ?? 0;
  const cy = centerNode.y ?? 0;
  const cz = centerNode.z ?? 0;

  centerNode.fx = cx; centerNode.fy = cy; centerNode.fz = cz;

  for (const [d, ids] of buckets.entries()) {
    if (d === 0) continue;
    const radius = gap * d;
    const n = ids.length || 1;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n;
      const x = cx + radius * Math.cos(angle);
      const z = cz + radius * Math.sin(angle);
      const node = graph.nodes.find((nd) => nd.id === ids[i]);
      if (!node) continue;
      node.fx = x;
      node.fy = cy;
      node.fz = z;
    }
  }
}

function applyLayeredLayout(centerNode, graph, depth, gapY, gapX = 120) {
  if (!centerNode || centerNode.id == null) return;
  const adj = buildAdjacency(graph.links);
  const levels = bfsLevels(centerNode.id, adj, depth);

  const buckets = new Map();
  levels.forEach((d, id) => {
    if (!buckets.has(d)) buckets.set(d, []);
    buckets.get(d).push(id);
  });

  const cx = centerNode.x ?? 0;
  const cy = centerNode.y ?? 0;
  const cz = centerNode.z ?? 0;

  centerNode.fx = cx; centerNode.fy = cy; centerNode.fz = cz;

  for (const [d, ids] of buckets.entries()) {
    const y = cy - d * gapY;
    const n = ids.length;
    const totalWidth = (n - 1) * gapX;
    for (let i = 0; i < n; i++) {
      const x = cx - totalWidth / 2 + i * gapX;
      const node = graph.nodes.find((nd) => nd.id === ids[i]);
      if (!node) continue;
      node.fx = x;
      node.fy = y;
      node.fz = cz;
    }
  }
}

function applyC4Layout(
  graph,
  opts = { groupKey: "table", columnGap: 300, rowGap: 120, origin: { x: 0, y: 0, z: 0 } }
) {
  const { groupKey, columnGap, rowGap, origin } = opts;
  if (!graph || !Array.isArray(graph.nodes)) return;
  graph.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });
  const groups = groupByField(graph.nodes, groupKey);
  const entries = Array.from(groups.entries());
  entries.forEach(([, nodes], idx) => {
    const gx = origin.x + idx * columnGap;
    nodes.forEach((node, j) => {
      node.fx = gx;
      node.fy = origin.y - j * rowGap;
      node.fz = origin.z;
    });
  });
}

function apply2DProjectionWithGrouping(graph, opts) {
  const {
    plane = "xz",
    groupKey = "table",
    clusterSpacing = 260,
    nodeRingRadius = 90,
    origin = { x: 0, y: 0, z: 0 },
  } = opts || {};

  graph.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });

  const groups = groupByField(graph.nodes, groupKey);
  const clusterCenters = gridPositions(groups.size, clusterSpacing);

  const axisLock = (pt, axis, val) => {
    if (axis === "y") return { x: pt.x, y: val, z: pt.z };
    if (axis === "z") return { x: pt.x, y: pt.y, z: val };
    return { x: val, y: pt.y, z: pt.z };
  };

  const entries = Array.from(groups.entries());
  entries.forEach(([, nodes], idx) => {
    const center = {
      x: origin.x + (clusterCenters[idx]?.x ?? 0),
      z: origin.z + (clusterCenters[idx]?.z ?? 0),
      y: origin.y,
    };

    const n = nodes.length || 1;
    const r = Math.max(40, nodeRingRadius);
    nodes.forEach((node, i) => {
      const a = (2 * Math.PI * i) / n;
      let px = center.x + r * Math.cos(a);
      let py = center.y;
      let pz = center.z + r * Math.sin(a);

      if (plane === "xy") {
        const p = axisLock({ x: px, y: py, z: pz }, "z", origin.z);
        px = p.x; py = p.y; pz = p.z;
      } else if (plane === "yz") {
        const p = axisLock({ x: px, y: py, z: pz }, "x", origin.x);
        px = p.x; py = p.y; pz = p.z;
      } else {
        const p = axisLock({ x: px, y: py, z: pz }, "y", origin.y);
        px = p.x; py = p.y; pz = p.z;
      }

      node.fx = px; node.fy = py; node.fz = pz;
    });
  });
}

// ───────────────────────── component ─────────────────────────
const Graph3D = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const [mode, setMode] = useState("schema");
  const [loading, setLoading] = useState(false);

  const fgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const [hoverNode, setHoverNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);
  const hoverNodeIdRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [layoutMode, setLayoutMode] = useState("radial");
  const [layoutDepth, setLayoutDepth] = useState(2);
  const [ringGap, setRingGap] = useState(80);
  const [layerGap, setLayerGap] = useState(100);
  const [autoLayoutOnSelect, setAutoLayoutOnSelect] = useState(true);

  const [c4GroupField, setC4GroupField] = useState("table");
  const [c4ColumnGap, setC4ColumnGap] = useState(300);
  const [c4RowGap, setC4RowGap] = useState(120);

  const [projectionMode, setProjectionMode] = useState("3d");
  const [groupField, setGroupField] = useState("table");
  const [clusterGap, setClusterGap] = useState(260);
  const [inClusterRadius, setInClusterRadius] = useState(90);

  // Новое: тумблер физики
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  // Отдельный фриз для подписей
  const [isFrozen, setIsFrozen] = useState(false);

  const focusOnNode = useCallback((node) => {
    if (!node || !fgRef.current) return;
    const offset = 60;
    const nx = node.x ?? 0, ny = node.y ?? 0, nz = node.z ?? 0;
    fgRef.current?.cameraPosition?.(
      { x: nx + offset, y: ny + offset, z: nz + offset },
      node,
      1500
    );
  }, []);

  // Сброс выбранного узла при изменении графа
  useEffect(() => { setSelectedNode(null); }, [graphData]);

  // Универсальный пересчёт раскладки. Вызывается на любое изменение контролов.
  const recomputeLayout = useCallback(() => {
    if (!graphData?.nodes?.length) return;

    // если в 2D — применяем 2D группировку
    if (projectionMode !== "3d") {
      apply2DProjectionWithGrouping(graphData, {
        plane: projectionMode,
        groupKey: groupField,
        clusterSpacing: clusterGap,
        nodeRingRadius: inClusterRadius,
        origin: selectedNode
          ? { x: selectedNode.x ?? 0, y: selectedNode.y ?? 0, z: selectedNode.z ?? 0 }
          : { x: 0, y: 0, z: 0 },
      });
      return;
    }

    // если C4
    if (layoutMode === "c4") {
      applyC4Layout(graphData, {
        groupKey: c4GroupField,
        columnGap: c4ColumnGap,
        rowGap: c4RowGap,
        origin: selectedNode
          ? { x: selectedNode.x ?? 0, y: selectedNode.y ?? 0, z: selectedNode.z ?? 0 }
          : { x: 0, y: 0, z: 0 },
      });
      return;
    }

    // radial/layered вокруг выбранного узла если есть
    const liveCenter = selectedNode
      ? graphData.nodes.find((n) => n.id === selectedNode.id) || selectedNode
      : null;

    // если нет центра и физика включена — отпустим, иначе не трогаем
    if (!liveCenter) {
      if (physicsEnabled) {
        graphData.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });
      }
      return;
    }

    // перед вычислением очистим фиксации
    graphData.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });

    if (layoutMode === "radial") {
      applyRadialLayout(liveCenter, graphData, layoutDepth, ringGap);
    } else {
      applyLayeredLayout(liveCenter, graphData, layoutDepth, layerGap);
    }
  }, [
    graphData,
    projectionMode, groupField, clusterGap, inClusterRadius,
    layoutMode, c4GroupField, c4ColumnGap, c4RowGap,
    layoutDepth, ringGap, layerGap,
    selectedNode, physicsEnabled
  ]);

  // Автоприменение: любое изменение параметров → мгновенная раскладка
  useEffect(() => { recomputeLayout(); }, [
    projectionMode, groupField, clusterGap, inClusterRadius,
    layoutMode, c4GroupField, c4ColumnGap, c4RowGap,
    layoutDepth, ringGap, layerGap,
    selectedNode, recomputeLayout
  ]);

  // Переключение физики не должно "гонять" узлы, если выключена
  useEffect(() => {
    if (!physicsEnabled) {
      // фиксируем текущие координаты
      graphData.nodes.forEach((n) => { n.fx = n.x; n.fy = n.y; n.fz = n.z; });
    } else {
      // отпускаем для пересчёта силами
      graphData.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });
      // и сразу применим текущую схему, чтобы задать стартовые позиции
      recomputeLayout();
    }
  }, [physicsEnabled]);

  const withFG = (fn) => { const fg = fgRef.current; if (fg && typeof fn === "function") fn(fg); };

  // freeze/release только для ярлыков
  const freezeEngineHard = useCallback(() => {
    graphData.nodes.forEach((n) => { n.fx = n.x; n.fy = n.y; n.fz = n.z; });
    setIsFrozen(true);
  }, [graphData]);

  const releaseEngine = useCallback(() => {
    setIsFrozen(false);
    if (physicsEnabled) {
      graphData.nodes.forEach((n) => { n.fx = n.fy = n.fz = undefined; });
    }
  }, [graphData, physicsEnabled]);

  const handleSelectNode = useCallback((node) => {
    if (!node || node.id == null) return;
    setSelectedNode(node);

    if (!autoLayoutOnSelect) { focusOnNode(node); return; }

    // мгновенный пересчёт вокруг выбранного узла
    recomputeLayout();
    focusOnNode(node);
  }, [autoLayoutOnSelect, focusOnNode, recomputeLayout]);

  // autoresize
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

  // fetch
  const fetchGraph = useCallback(async (selectedMode) => {
    setLoading(true);
    try {
      const resp = await axios.get(`visual/api/graph?mode=${encodeURIComponent(selectedMode)}`);
      const safe = normalizeGraph(resp.data);
      setGraphData(safe);
    } catch (err) {
      console.error("Failed to fetch graph data", err);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(mode); }, [mode, fetchGraph]);

  // hover map
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

  const handleNodeHover = useCallback((node) => {
    const id = node?.id ?? null;
    if (hoverNodeIdRef.current !== id) {
      hoverNodeIdRef.current = id;
      setHoverNode(node || null);
    }
  }, []);

  const isNodeHighlighted = useCallback((node) => {
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
  }, [hoverNode, hoverLink, neighborMap]);

  const isLinkHighlighted = useCallback((link) => {
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
  }, [hoverNode, hoverLink]);

  // colors & labels
  function lightenHsl(color, addL = 10) {
    if (color.startsWith("hsl")) {
      const m = color.match(/hsl\((\d+),\s*(\d+)%\s*,\s*(\d+)%\)/i);
      if (m) {
        const h = +m[1], s = +m[2], l = Math.min(100, +m[3] + addL);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    return color;
  }

  const nodeColor = (node) => {
    const baseColor = (() => {
      if (mode === "schema") return "#4F46E5";
      let str = layoutMode === "c4"
        ? (node[c4GroupField] || node.table || node.id || "")
        : (node.table || node.id || "");
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 60%, 50%)`;
    })();
    return isNodeHighlighted(node) ? lightenHsl(baseColor, 15) : baseColor;
  };

  const linkColor = (link) => (isLinkHighlighted(link) ? "#FFC107" : "#9CA3AF");
  const linkWidth = (link) => (isLinkHighlighted(link) ? 2.5 : 1);
  const linkOpacity = (link) => (isLinkHighlighted(link) ? 0.9 : 0.3);

  const getDiagramLabel = (node) => {
    if (layoutMode === "c4") {
      const title = node.title || node.name || node.id;
      const group = node[c4GroupField] ? `[${node[c4GroupField]}]` : "";
      return `${title ?? ""} ${group}`.trim();
    }
    if (mode === "schema") return String(node.id ?? "");
    const title = node.title || node.name || node.id;
    const table = node.table ? `[${node.table}]` : "";
    return `${title ?? ""} ${table}`.trim();
  };

  const nodeThreeObject = isFrozen
    ? (node) => {
      const label = new SpriteText(getDiagramLabel(node));
      label.fontSize = 6;
      label.padding = 2;
      label.backgroundColor = "rgba(0,0,0,0.55)";
      label.borderRadius = 2;
      label.color = "#fff";
      label.position.set(0, 8, 0);
      return label;
    }
    : undefined;

  const safeGraph = useMemo(
    () => ({
      nodes: Array.isArray(graphData?.nodes) ? graphData.nodes : [],
      links: Array.isArray(graphData?.links) ? graphData.links : [],
    }),
    [graphData]
  );

  return (
    <div ref={containerRef} style={{ width: "100%", height: "95vh", position: "relative" }}>
      {/* Панель инструментов */}
      <div style={{ marginBottom: "0.5rem", position: "absolute", zIndex: 2 }}>
        <button
          onClick={() => setMode("schema")}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem 1rem",
            background: mode === "schema" ? "#6366F1" : "#E5E7EB",
            color: mode === "schema" ? "#fff" : "#374151",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Schema Mode
        </button>
        <button
          onClick={() => setMode("data")}
          style={{
            padding: "0.5rem 1rem",
            background: mode === "data" ? "#6366F1" : "#E5E7EB",
            color: mode === "data" ? "#fff" : "#374151",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Data Mode
        </button>

        <div className="toolbar" style={{ display: "inline-flex", gap: 8, marginLeft: 8 }}>
          {/* Тумблер физики */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={physicsEnabled}
              onChange={(e) => setPhysicsEnabled(e.target.checked)}
            />
            Physics
          </label>

          {/* Режим раскладки */}
          <div>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              style={{ padding: 4 }}
            >
              <option value="radial">Radial (эго-граф)</option>
              <option value="layered">Layered (слои)</option>
              <option value="c4">C4 diagram</option>
            </select>
          </div>

          {/* ego/layered sliders */}
          {layoutMode !== "c4" && (
            <>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Depth
                <input
                  type="range" min="1" max="5" value={layoutDepth}
                  onChange={(e) => setLayoutDepth(+e.target.value)}
                />
              </label>

              {layoutMode !== "layered" ? (
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Ring gap
                  <input
                    type="range" min="40" max="200" value={ringGap}
                    onChange={(e) => setRingGap(+e.target.value)}
                  />
                </label>
              ) : (
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Layer gap
                  <input
                    type="range" min="60" max="240" value={layerGap}
                    onChange={(e) => setLayerGap(+e.target.value)}
                  />
                </label>
              )}
            </>
          )}

          {/* C4 controls */}
          {layoutMode === "c4" && (
            <>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Group by
                <input
                  type="text" value={c4GroupField}
                  onChange={(e) => setC4GroupField(e.target.value)}
                  style={{ width: 110 }} placeholder="table | type | ..."
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Column gap
                <input
                  type="range" min="120" max="600" value={c4ColumnGap}
                  onChange={(e) => setC4ColumnGap(+e.target.value)}
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Row gap
                <input
                  type="range" min="60" max="240" value={c4RowGap}
                  onChange={(e) => setC4RowGap(+e.target.value)}
                />
              </label>
            </>
          )}

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={autoLayoutOnSelect}
              onChange={(e) => setAutoLayoutOnSelect(e.target.checked)}
            />
            Auto-layout on select
          </label>

          {/* 2D ПРОЕКЦИЯ */}
          <div style={{ borderLeft: "1px solid #ccc", height: 24, alignSelf: "center" }} />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Projection
            <select
              value={projectionMode}
              onChange={(e) => setProjectionMode(e.target.value)}
              style={{ padding: 4 }}
            >
              <option value="3d">3D</option>
              <option value="xz">2D-XZ (y=const)</option>
              <option value="xy">2D-XY (z=const)</option>
              <option value="yz">2D-YZ (x=const)</option>
            </select>
          </label>

          {layoutMode !== "c4" && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Group by
              <input
                type="text" value={groupField}
                onChange={(e) => setGroupField(e.target.value)}
                style={{ width: 110 }} placeholder="table | type | ..."
              />
            </label>
          )}

          {layoutMode !== "c4" && (
            <>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Cluster gap
                <input
                  type="range" min="120" max="520" value={clusterGap}
                  onChange={(e) => setClusterGap(+e.target.value)}
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                In-cluster R
                <input
                  type="range" min="40" max="240" value={inClusterRadius}
                  onChange={(e) => setInClusterRadius(+e.target.value)}
                />
              </label>
            </>
          )}

          {/* Мгновенное применение уже происходит. Кнопка не нужна, но оставлю для явного вызова. */}
          <button onClick={recomputeLayout}>Apply</button>

          {!isFrozen ? (
            <button onClick={freezeEngineHard}>Freeze (with labels)</button>
          ) : (
            <button onClick={releaseEngine}>Release</button>
          )}

          {selectedNode && (
            <button onClick={() => focusOnNode(selectedNode)}>Focus node</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", paddingTop: "3rem" }}>Loading graph...</div>
      ) : (
        <ForceGraph3D
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={safeGraph}
          enableNodeDrag={true}
          // Постоянная/выключенная физика:
          cooldownTicks={physicsEnabled ? Infinity : 0}
          warmupTicks={0}
          nodeColor={nodeColor}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={linkOpacity}
          nodeLabel={(node) =>
            mode === "schema"
              ? String(node.id ?? "")
              : `${node.table ?? ""}\n${JSON.stringify(node.data ?? {}, null, 2)}`
          }
          linkLabel={(link) => link.label}
          onNodeHover={(n) => {
            handleNodeHover(n);
          }}
          onLinkHover={(link) => setHoverLink(link || null)}
          onNodeClick={handleSelectNode}
          // onLinkClick={(link) => {
          //   const tgt = typeof link.target === "object" ? link.target : null;
          //   const src = typeof link.source === "object" ? link.source : null;
          //   if (!tgt || !src) return;
          //   const tx = tgt.x ?? 0, ty = tgt.y ?? 0, tz = tgt.z ?? 0;
          //   const sx = src.x ?? 0, sy = src.y ?? 0, sz = src.z ?? 0;
          //   const dx = tx - sx, dy = ty - sy, dz = tz - sz;
          //   const len = Math.hypot(dx, dy, dz) || 1;
          //   const nx = dx / len, ny = dy / len, nz = dz / len;
          //   const offset = 30;
          //   fgRef.current?.cameraPosition?.(
          //     { x: tx + nx * offset, y: ty + ny * offset, z: tz + nz * offset },
          //     tgt,
          //     1500
          //   );
          // }}
          nodeThreeObjectExtend={true}
          nodeThreeObject={nodeThreeObject}
          backgroundColor="#111827"
        />
      )}
    </div>
  );
};

export default Graph3D;
