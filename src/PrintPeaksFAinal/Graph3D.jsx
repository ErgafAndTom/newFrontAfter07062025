// Graph3D_with_comments.jsx
// + 2D-проекция с группировкой по полю (по умолч. table) и сеткой кластеров

import axios from "../api/axiosInstance";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

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
    .filter(
      (l) =>
        l &&
        (l.source ?? l.src ?? l.from) != null &&
        (l.target ?? l.tgt ?? l.to) != null
    )
    .map((l) => ({
      source: l.source ?? l.src ?? l.from,
      target: l.target ?? l.tgt ?? l.to,
      label: l.label,
      ...l,
    }));

  return { nodes, links };
}

const Graph3D = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [mode, setMode] = useState("schema");
  const [loading, setLoading] = useState(false);
  const [coolTicks, setCoolTicks] = useState(120);

  const fgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  // hover/select
  const [hoverNode, setHoverNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);
  const hoverNodeIdRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // раскладки
  const [layoutMode, setLayoutMode] = useState("radial"); // 'radial' | 'layered'
  const [layoutDepth, setLayoutDepth] = useState(2);
  const [ringGap, setRingGap] = useState(80);
  const [layerGap, setLayerGap] = useState(100);
  const [autoLayoutOnSelect, setAutoLayoutOnSelect] = useState(true);

  // проекция и группировка
  const [projectionMode, setProjectionMode] = useState("3d"); // '3d' | 'xz' | 'xy' | 'yz'
  const [groupField, setGroupField] = useState("table"); // ключ для групп
  const [clusterGap, setClusterGap] = useState(260); // расстояние между центрами кластеров
  const [inClusterRadius, setInClusterRadius] = useState(90); // радиус кольца внутри кластера
  const [isFrozen, setIsFrozen] = useState(false);

  // ---------- utils: adjacency + раскладки ----------
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

    centerNode.fx = cx;
    centerNode.fy = cy;
    centerNode.fz = cz;

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
  useEffect(() => {
    setSelectedNode(null);
  }, [graphData]);

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

    centerNode.fx = cx;
    centerNode.fy = cy;
    centerNode.fz = cz;

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

  // ---------- 2D ПРОЕКЦИЯ С ГРУППИРОВКОЙ ----------
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
    // почти квадратная сетка
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

  function apply2DProjectionWithGrouping(graph, opts) {
    const {
      plane = "xz", // 'xz' => y=const; 'xy' => z=const; 'yz' => x=const
      groupKey = "table",
      clusterSpacing = 260,
      nodeRingRadius = 90,
      origin = { x: 0, y: 0, z: 0 },
    } = opts || {};

    // сброс фиксаций
    graph.nodes.forEach((n) => {
      n.fx = n.fy = n.fz = undefined;
    });

    const groups = groupByField(graph.nodes, groupKey);
    const clusterCenters = gridPositions(groups.size, clusterSpacing);

    const axisLock = (pt, axis, val) => {
      if (axis === "y") return { x: pt.x, y: val, z: pt.z };
      if (axis === "z") return { x: pt.x, y: pt.y, z: val };
      // axis === 'x'
      return { x: val, y: pt.y, z: pt.z };
    };

    // раздать центры
    const entries = Array.from(groups.entries());
    entries.forEach(([gname, nodes], idx) => {
      const center = {
        x: origin.x + (clusterCenters[idx]?.x ?? 0),
        z: origin.z + (clusterCenters[idx]?.z ?? 0),
        y: origin.y,
      };

      // узлы в кластере по кольцу
      const n = nodes.length || 1;
      const r = Math.max(40, nodeRingRadius);
      nodes.forEach((node, i) => {
        const a = (2 * Math.PI * i) / n;
        // базовая раскладка в плоскости XZ
        let px = center.x + r * Math.cos(a);
        let py = center.y;
        let pz = center.z + r * Math.sin(a);

        // спроецировать на нужную плоскость
        if (plane === "xy") {
          // держим z = const
          const p = axisLock({ x: px, y: py, z: pz }, "z", origin.z);
          px = p.x; py = p.y; pz = p.z;
        } else if (plane === "yz") {
          // держим x = const
          const p = axisLock({ x: px, y: py, z: pz }, "x", origin.x);
          px = p.x; py = p.y; pz = p.z;
        } else {
          // 'xz' — держим y = const
          const p = axisLock({ x: px, y: py, z: pz }, "y", origin.y);
          px = p.x; py = p.y; pz = p.z;
        }

        node.fx = px;
        node.fy = py;
        node.fz = pz;
      });
    });
  }

  function withFG(fn) {
    const fg = fgRef.current;
    if (fg && typeof fn === "function") fn(fg);
  }

  // ---------- freeze/release ----------
  const freezeEngineHard = useCallback(() => {
    graphData.nodes.forEach((n) => {
      n.fx = n.x;
      n.fy = n.y;
      n.fz = n.z;
    });
    setIsFrozen(true);
    setCoolTicks(0);
  }, [graphData]);

  const releaseEngine = useCallback(
    (ticks = 80) => {
      graphData.nodes.forEach((n) => {
        n.fx = n.fy = n.fz = undefined;
      });
      setIsFrozen(false);
      setCoolTicks(ticks);
    },
    [graphData]
  );

  const handleSelectNode = useCallback(
    (node) => {
      if (!node || node.id == null) return;
      setSelectedNode(node);
      // перед новой выкладкой
      graphData.nodes.forEach((n) => {
        n.fx = n.fy = n.fz = undefined;
      });

      if (projectionMode !== "3d") {
        apply2DProjectionWithGrouping(graphData, {
          plane:
            projectionMode === "xz"
              ? "xz"
              : projectionMode === "xy"
                ? "xy"
                : "yz",
          groupKey: groupField,
          clusterSpacing: clusterGap,
          nodeRingRadius: inClusterRadius,
          origin: { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
        });
        setCoolTicks(0);
        return;
      }

      if (layoutMode === "radial") {
        applyRadialLayout(node, graphData, layoutDepth, ringGap);
      } else {
        applyLayeredLayout(node, graphData, layoutDepth, layerGap);
      }
      setCoolTicks(0);
    },
    [
      graphData,
      layoutMode,
      layoutDepth,
      ringGap,
      layerGap,
      projectionMode,
      groupField,
      clusterGap,
      inClusterRadius,
    ]
  );

  // ---------- autoresize ----------
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

  // ---------- fetch ----------
  const fetchGraph = useCallback(async (selectedMode) => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `visual/api/graph?mode=${encodeURIComponent(selectedMode)}`
      );
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

  // ---------- hover highlight ----------
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
        const sid =
          typeof hoverLink.source === "object" ? hoverLink.source.id : hoverLink.source;
        const tid =
          typeof hoverLink.target === "object" ? hoverLink.target.id : hoverLink.target;
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
        const hs =
          typeof hoverLink.source === "object" ? hoverLink.source.id : hoverLink.source;
        const ht =
          typeof hoverLink.target === "object" ? hoverLink.target.id : hoverLink.target;
        return (s === hs && t === ht) || (s === ht && t === hs);
      }
      if (hoverNode) return s === hoverNode.id || t === hoverNode.id;
      return false;
    },
    [hoverNode, hoverLink]
  );

  // ---------- colors & labels ----------
  function lightenHsl(color, addL = 10) {
    if (color.startsWith("hsl")) {
      const m = color.match(/hsl\((\d+),\s*(\d+)%\s*,\s*(\d+)%\)/i);
      if (m) {
        const h = +m[1];
        const s = +m[2];
        const l = Math.min(100, +m[3] + addL);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    return color;
  }

  const nodeColor = (node) => {
    const baseColor = (() => {
      if (mode === "schema") return "#4F46E5";
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

  const getDiagramLabel = (node) => {
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
          {/* Режим раскладки */}
          <div>
            <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value)} style={{ padding: 4 }}>
              <option value="radial">Radial (эго-граф)</option>
              <option value="layered">Layered (слои)</option>
            </select>
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Depth
            <input
              type="range"
              min="1"
              max="5"
              value={layoutDepth}
              onChange={(e) => setLayoutDepth(+e.target.value)}
            />
          </label>

          {layoutMode !== "layered" ? (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Ring gap
              <input
                type="range"
                min="40"
                max="200"
                value={ringGap}
                onChange={(e) => setRingGap(+e.target.value)}
              />
            </label>
          ) : (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Layer gap
              <input
                type="range"
                min="60"
                max="240"
                value={layerGap}
                onChange={(e) => setLayerGap(+e.target.value)}
              />
            </label>
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

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Group by
            <input
              type="text"
              value={groupField}
              onChange={(e) => setGroupField(e.target.value)}
              style={{ width: 110 }}
              placeholder="table | type | ..."
            />
          </label>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Cluster gap
            <input
              type="range"
              min="120"
              max="520"
              value={clusterGap}
              onChange={(e) => setClusterGap(+e.target.value)}
            />
          </label>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            In-cluster R
            <input
              type="range"
              min="40"
              max="240"
              value={inClusterRadius}
              onChange={(e) => setInClusterRadius(+e.target.value)}
            />
          </label>

          <button
            onClick={() => {
              if (projectionMode !== "3d") {
                apply2DProjectionWithGrouping(graphData, {
                  plane:
                    projectionMode === "xz"
                      ? "xz"
                      : projectionMode === "xy"
                        ? "xy"
                        : "yz",
                  groupKey: groupField,
                  clusterSpacing: clusterGap,
                  nodeRingRadius: inClusterRadius,
                  origin: selectedNode
                    ? { x: selectedNode.x ?? 0, y: selectedNode.y ?? 0, z: selectedNode.z ?? 0 }
                    : { x: 0, y: 0, z: 0 },
                });
                setCoolTicks(0);
                return;
              }

              const liveCenter = selectedNode
                ? graphData.nodes.find((n) => n.id === selectedNode.id) || selectedNode
                : null;

              graphData.nodes.forEach((n) => {
                n.fx = n.fy = n.fz = undefined;
              });

              if (liveCenter) {
                if (layoutMode === "radial") {
                  applyRadialLayout(liveCenter, graphData, layoutDepth, ringGap);
                } else {
                  applyLayeredLayout(liveCenter, graphData, layoutDepth, layerGap);
                }
              }
              setCoolTicks(0);
            }}
          >
            Apply
          </button>

          {!isFrozen ? (
            <button onClick={freezeEngineHard}>Freeze (with labels)</button>
          ) : (
            <button onClick={() => releaseEngine(80)}>Release</button>
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
          enableNodeDrag={false}
          cooldownTicks={isFrozen ? 0 : coolTicks}
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
          onNodeHover={handleNodeHover}
          onLinkHover={(link) => setHoverLink(link || null)}
          onNodeClick={handleSelectNode}
          onLinkClick={(link) => {
            const tgt = typeof link.target === "object" ? link.target : null;
            const src = typeof link.source === "object" ? link.source : null;
            if (!tgt || !src) return;
            const tx = tgt.x ?? 0,
              ty = tgt.y ?? 0,
              tz = tgt.z ?? 0;
            const sx = src.x ?? 0,
              sy = src.y ?? 0,
              sz = src.z ?? 0;
            const dx = tx - sx,
              dy = ty - sy,
              dz = tz - sz;
            const len = Math.hypot(dx, dy, dz) || 1;
            const nx = dx / len,
              ny = dy / len,
              nz = dz / len;
            const offset = 30;
            fgRef.current?.cameraPosition?.(
              { x: tx + nx * offset, y: ty + ny * offset, z: tz + nz * offset },
              tgt,
              1500
            );
          }}
          nodeThreeObject={
            isFrozen
              ? (node) => {
                const label = new SpriteText(getDiagramLabel(node));
                label.fontSize = 550;
                label.padding = 2;
                label.backgroundColor = "rgba(0,0,0,0.55)";
                label.borderRadius = 2;
                label.color = "#fff";
                label.position.set(0, 8, 0);
                return label;
              }
              : undefined
          }
          nodeThreeObjectExtend={true}
          backgroundColor="#111827"
        />
      )}
    </div>
  );
};

export default Graph3D;
