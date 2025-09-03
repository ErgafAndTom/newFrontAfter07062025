// Graph3D_with_comments.jsx
// + автосайз контейнера
// + подсветка активного узла и его соседей (узлы/рёбра)
// + клик по ребру: «follow link» перелёт камеры к target
// + раскладки: radial/layered
// + Freeze: жёсткая фиксация координат + постоянные подписи нодов как в диаграммах

import axios from "../api/axiosInstance";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext"; // <- подписи-спрайты

function normalizeGraph(raw) {
  const nodesRaw = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const linksRaw = Array.isArray(raw?.links)
    ? raw.links
    : Array.isArray(raw?.edges)
      ? raw.edges
      : [];

  // ❤️ всегда есть id
  const nodes = nodesRaw.map((n, i) => {
    const id =
      n.id ?? n.ID ?? n.key ?? n.name ?? n.title ?? n.uuid ?? n._id ?? String(i);
    return { id, ...n }; // не перезатираем существующие поля
  });

  const links = linksRaw
    .filter(l =>
      l &&
      (l.source ?? l.src ?? l.from) != null &&
      (l.target ?? l.tgt ?? l.to) != null
    )
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
  const [mode, setMode] = useState("schema");
  const [loading, setLoading] = useState(false);
  const [coolTicks, setCoolTicks] = useState(120); // сколько тиков дать движку поработать

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

  // «заморожена ли сцена» — влияет и на подписи
  const [isFrozen, setIsFrozen] = useState(false);

  // ---------- utils: adjacency + раскладки ----------
  function buildAdjacency(links) {
    const adj = new Map();
    for (const l of links) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (s == null || t == null) continue; // 🔒
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
    if (!centerNode || centerNode.id == null) return; // 🔒
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
    if (!centerNode || centerNode.id == null) return; // 🔒
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

  function withFG(fn) {
    const fg = fgRef.current;
    if (fg && typeof fn === "function") fn(fg);
  }

  // ---------- freeze/release ----------
  const freezeEngineHard = useCallback(() => {
    graphData.nodes.forEach(n => {
      n.fx = n.x; n.fy = n.y; n.fz = n.z;
    });
    setIsFrozen(true);
    setCoolTicks(0); // стопим симуляцию через пропсу
  }, [graphData]);

  const releaseEngine = useCallback((ticks = 80) => {
    graphData.nodes.forEach(n => { n.fx = n.fy = n.fz = undefined; });
    setIsFrozen(false);
    setCoolTicks(ticks); // даём движку подышать
  }, [graphData]);

  const handleSelectNode = useCallback(
    (node) => {
      if (!node || node.id == null) return; // 🔒
      setSelectedNode(node);
      // снимаем фиксации — перед новой выкладкой
      graphData.nodes.forEach((n) => {
        n.fx = n.fy = n.fz = undefined;
      });

      if (layoutMode === "radial") {
        applyRadialLayout(selectedNode, graphData, layoutDepth, ringGap);
      } else {
        applyLayeredLayout(selectedNode, graphData, layoutDepth, layerGap);
      }
      setCoolTicks(0); // остановить «подтягивания»
    },
    [graphData, layoutMode, layoutDepth, ringGap, layerGap, autoLayoutOnSelect]
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
      for (let i = 0; i < str.length; i++)
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 60%, 50%)`;
    })();
    return isNodeHighlighted(node) ? lightenHsl(baseColor, 15) : baseColor;
  };

  const linkColor = (link) => (isLinkHighlighted(link) ? "#FFC107" : "#9CA3AF");
  const linkWidth = (link) => (isLinkHighlighted(link) ? 2.5 : 1);
  const linkOpacity = (link) => (isLinkHighlighted(link) ? 0.9 : 0.3);

  // текст для «диаграммной» подписи узла при заморозке
  const getDiagramLabel = (node) => {
    if (mode === "schema") return String(node.id ?? "");
    // для data-режима полезнее краткая строка
    const title = node.title || node.name || node.id;
    const table = node.table ? `[${node.table}]` : "";
    return `${title ?? ""} ${table}`.trim();
  };

  // Когда сцена заморожена — добавляем nodeThreeObject с подписью.
  // В разморозке — возвращаем null (стандартные сферы останутся).
  const nodeThreeObject = isFrozen
    ? (node) => {
      const label = new SpriteText(getDiagramLabel(node));
      label.fontSize = 6;          // подбирай под масштаб
      label.padding = 2;
      label.backgroundColor = "rgba(0,0,0,0.55)";
      label.borderRadius = 2;
      label.color = "#fff";
      // небольшое смещение вверх, чтобы не перекрывало сам шар
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
    <div
      ref={containerRef}
      style={{ width: "100%", height: "95vh", position: "relative" }}
    >
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
          <div>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              style={{ padding: 4 }}
            >
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

          <button onClick={() => {
            if (!selectedNode) return;

            // находим «живую» версию нода в текущем graphData
            const liveCenter =
              graphData.nodes.find(n => n.id === selectedNode.id) || selectedNode;

            if (!liveCenter || liveCenter.id == null) return; // 🔒

            // сброс фиксаций
            graphData.nodes.forEach(n => { n.fx = n.fy = n.fz = undefined; });

            if (layoutMode === 'radial') {
              applyRadialLayout(liveCenter, graphData, layoutDepth, ringGap);
            } else {
              applyLayeredLayout(liveCenter, graphData, layoutDepth, layerGap);
            }

            // глушим подпрыгивания (через стейт-пропсу, как мы уже сделали)
            setCoolTicks(0);
          }}>
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
          cooldownTicks={isFrozen ? 0 : coolTicks}  // <-- ключевая строка
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
            const tx = tgt.x ?? 0, ty = tgt.y ?? 0, tz = tgt.z ?? 0;
            const sx = src.x ?? 0, sy = src.y ?? 0, sz = src.z ?? 0;
            const dx = tx - sx, dy = ty - sy, dz = tz - sz;
            const len = Math.hypot(dx, dy, dz) || 1;
            const nx = dx / len, ny = dy / len, nz = dz / len;
            const offset = 30;
            fgRef.current?.cameraPosition?.(
              { x: tx + nx * offset, y: ty + ny * offset, z: tz + nz * offset },
              tgt,
              1500
            );
          }}

          // подписи-спрайты только когда заморожено
          nodeThreeObject={isFrozen ? (node) => {
            // const SpriteText = require('three-spritetext').default; // если ESM/SSR капризничает
            const label = new SpriteText(getDiagramLabel(node));
            label.fontSize = 50; label.padding = 2;
            label.backgroundColor = "rgba(0,0,0,0.55)";
            label.borderRadius = 2; label.color = "#fff";
            label.position.set(0, 8, 0);
            return label;
          } : undefined}
          nodeThreeObjectExtend={true}

          backgroundColor="#111827"
        />
      )}
    </div>
  );
};

export default Graph3D;
