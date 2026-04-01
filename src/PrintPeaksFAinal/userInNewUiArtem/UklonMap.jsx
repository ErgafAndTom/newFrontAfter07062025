import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths (webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons
// Uklon-style markers (жовтий акцент)
const pickupIcon = L.divIcon({
  className: "ukl-map-marker",
  html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center">
    <div style="background:#FFD600;width:12px;height:12px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const dropoffIcon = L.divIcon({
  className: "ukl-map-marker",
  html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;width:12px;height:12px;border-radius:50%;border:3px solid #FFD600;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const courierIcon = L.divIcon({
  className: "ukl-map-marker",
  html: `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center">
    <div style="background:#FFD600;width:32px;height:32px;border-radius:50%;border:2px solid #333;box-shadow:0 2px 10px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-size:16px">🚗</div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/**
 * UklonMap — Leaflet карта з маршрутом та позицією кур'єра
 * Props:
 *   pickup: { lat, lng }
 *   dropoffs: [{ lat, lng }]
 *   deliveryId: string (Uklon order ID)
 *   status: string
 *   onCourierUpdate: (courierData) => void
 */
const UklonMap = ({ pickup, dropoffs = [], deliveryId, status, onCourierUpdate, onStatusChange, onSimulationChange }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const courierMarker = useRef(null);
  const routeLine = useRef(null);          // pickup → dropoff (блакитний)
  const courierRouteLine = useRef(null);   // водій → pickup (помаранчевий пунктир)
  const trafficLayer = useRef(null);
  const baseLayer = useRef(null);
  const [courierPos, setCourierPos] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const simInterval = useRef(null);
  const simRouteCoords = useRef([]);

  // Ініціалізація карти
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const pLat = parseFloat(pickup?.lat);
    const pLng = parseFloat(pickup?.lng);
    if (!pLat || !pLng) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
      zoomAnimation: false,
      fadeAnimation: false,
    }).setView([pLat, pLng], 12);

    // Google Maps тайли (без пробок)
    baseLayer.current = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
    }).addTo(map);

    // Google Maps тайли (з пробками) — замінює базовий шар
    trafficLayer.current = L.tileLayer("https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}", {
      maxZoom: 20,
    });

    // Pickup marker
    L.marker([pLat, pLng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Забір</b><br/><span style="font-size:11px;color:#666">${pLat.toFixed(6)}, ${pLng.toFixed(6)}</span>`);

    // Dropoff markers
    const points = [[pLat, pLng]];
    dropoffs.forEach((d, i) => {
      const dLat = parseFloat(d?.lat);
      const dLng = parseFloat(d?.lng);
      if (!dLat || !dLng) return;
      L.marker([dLat, dLng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(`<b>Доставка ${dropoffs.length > 1 ? i + 1 : ""}</b><br/><span style="font-size:11px;color:#666">${dLat.toFixed(6)}, ${dLng.toFixed(6)}</span>`);
      points.push([dLat, dLng]);
    });

    // Реальний маршрут через OSRM
    if (points.length >= 2) {
      // Спочатку пряма лінія як fallback
      routeLine.current = L.polyline(points, {
        color: "#0597ff",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 16 });

      // Запит реального маршруту
      const coords = points.map(p => `${p[1]},${p[0]}`).join(";");
      fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            simRouteCoords.current = routeCoords;
            if (routeLine.current) {
              routeLine.current.setLatLngs(routeCoords);
              map.fitBounds(L.latLngBounds(routeCoords).pad(0.1), { maxZoom: 16 });
            }
          }
        })
        .catch(() => { /* fallback — пряма лінія залишається */ });
    }

    mapInstance.current = map;

    return () => {
      try {
        map.stop();
        map.off();
        map.remove();
      } catch (_) { /* ignore leaflet cleanup errors */ }
      mapInstance.current = null;
      courierMarker.current = null;
      routeLine.current = null;
      courierRouteLine.current = null;
    };
  }, [pickup?.lat, pickup?.lng, dropoffs]);

  // Toggle traffic layer — замінюємо базовий шар
  useEffect(() => {
    if (!mapInstance.current || !trafficLayer.current || !baseLayer.current) return;
    if (showTraffic) {
      mapInstance.current.removeLayer(baseLayer.current);
      trafficLayer.current.addTo(mapInstance.current);
      // Перемістити traffic під маркери
      trafficLayer.current.setZIndex(0);
    } else {
      mapInstance.current.removeLayer(trafficLayer.current);
      baseLayer.current.addTo(mapInstance.current);
      baseLayer.current.setZIndex(0);
    }
  }, [showTraffic]);

  // WebSocket — real-time позиція водія від webhook (без polling)
  useEffect(() => {
    const handler = (e) => {
      const { deliveryId: wsDeliveryId, location } = e.detail || {};
      if (!wsDeliveryId || wsDeliveryId !== deliveryId || !location) return;
      const lat = location.latitude;
      const lng = location.longitude;
      if (lat && lng) {
        console.log('%c[Uklon:FE:Map] 📡 WS driver position:', 'color: #FFD600', lat, lng);
        setCourierPos({ lat, lng });
        onCourierUpdate?.({ latitude: lat, longitude: lng });
      }
    };
    window.addEventListener('uklonDriverPosition', handler);
    return () => window.removeEventListener('uklonDriverPosition', handler);
  }, [deliveryId, onCourierUpdate]);

  // Оновити маркер кур'єра + маршрути на карті
  useEffect(() => {
    if (!mapInstance.current || !courierPos?.lat || !courierPos?.lng) return;

    const map = mapInstance.current;
    const pos = [courierPos.lat, courierPos.lng];
    const pLat = parseFloat(pickup?.lat);
    const pLng = parseFloat(pickup?.lng);
    const st = (status || '').toLowerCase();
    const beforePickup = ['accepted', 'processing', 'placed', 'waiting_for_processing'].includes(st);

    // Маркер водія
    if (courierMarker.current) {
      courierMarker.current.setLatLng(pos);
      courierMarker.current.setPopupContent(`<b>Водій</b><br/><span style="font-size:11px;color:#666">${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}</span>`);
    } else {
      courierMarker.current = L.marker(pos, { icon: courierIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<b>Водій</b><br/><span style="font-size:11px;color:#666">${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}</span>`);
    }

    if (beforePickup && pLat && pLng) {
      // ── Водій ще їде до точки забору ──
      // Помаранчева пунктирна лінія: водій → pickup (пряма — без OSRM запитів)
      if (courierRouteLine.current) {
        courierRouteLine.current.setLatLngs([pos, [pLat, pLng]]);
      } else {
        courierRouteLine.current = L.polyline([pos, [pLat, pLng]], {
          color: '#f5a623',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 8',
        }).addTo(map);
      }
      // Основний маршрут pickup → dropoff залишається як є
    } else if (st === 'returning' || st === 'returned') {
      // ── Повернення — водій їде назад до pickup ──
      if (courierRouteLine.current) {
        map.removeLayer(courierRouteLine.current);
        courierRouteLine.current = null;
      }
      if (routeLine.current && pLat && pLng) {
        routeLine.current.setLatLngs([pos, [pLat, pLng]]);
        routeLine.current.setStyle({ color: '#f5a623', dashArray: '10, 8' });
      }
    } else {
      // ── Водій забрав посилку, їде до клієнта ──
      if (courierRouteLine.current) {
        map.removeLayer(courierRouteLine.current);
        courierRouteLine.current = null;
      }
      // Пряма лінія від водія до dropoff (без OSRM запитів)
      if (routeLine.current && dropoffs?.[0]) {
        const dLat = parseFloat(dropoffs[0]?.lat);
        const dLng = parseFloat(dropoffs[0]?.lng);
        if (dLat && dLng) {
          routeLine.current.setLatLngs([pos, [dLat, dLng]]);
        }
      }
    }
  }, [courierPos, dropoffs, status, pickup]);

  // Симуляція кур'єра — повний цикл зі статусами
  const startSimulation = useCallback(async () => {
    const pLat = parseFloat(pickup?.lat);
    const pLng = parseFloat(pickup?.lng);
    const dLat = parseFloat(dropoffs?.[0]?.lat);
    const dLng = parseFloat(dropoffs?.[0]?.lng);
    if (!pLat || !pLng || !dLat || !dLng) return;

    setSimulating(true);
    onSimulationChange?.(true);

    // Випадкова стартова точка кур'єра (±0.01 від забору)
    const startLat = pLat + (Math.random() - 0.5) * 0.02;
    const startLng = pLng + (Math.random() - 0.5) * 0.02;

    // Допоміжна: побудувати маршрут OSRM
    const buildRoute = async (from, to) => {
      try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`);
        const data = await r.json();
        if (data.routes?.[0]?.geometry?.coordinates) {
          return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        }
      } catch {}
      // fallback — пряма
      return [from, to];
    };

    // Допоміжна: анімувати рух по маршруту
    const animate = (route, speed = 500) => new Promise(resolve => {
      let step = 0;
      const skip = Math.max(1, Math.floor(route.length / 60));
      simInterval.current = setInterval(() => {
        if (step >= route.length) {
          clearInterval(simInterval.current);
          resolve();
          return;
        }
        const pos = route[Math.min(step, route.length - 1)];
        setCourierPos({ lat: pos[0], lng: pos[1] });
        step += skip;
      }, speed);
    });

    const pause = (ms) => new Promise(r => setTimeout(r, ms));
    const now = () => new Date().toISOString();

    try {
      // 0. Пошук водія
      onStatusChange?.('processing', { statusTimes: { processing: now() } });
      await pause(3000);

      // 1. Водій прийняв замовлення і їде до забору
      onStatusChange?.('accepted', { statusTimes: { processing: now(), accepted: now() } });
      setCourierPos({ lat: startLat, lng: startLng });
      const routeToPickup = await buildRoute([startLat, startLng], [pLat, pLng]);
      simRouteCoords.current = routeToPickup;
      await animate(routeToPickup, 400);

      // 2. Водій прибув на точку забору
      setCourierPos({ lat: pLat, lng: pLng });
      onStatusChange?.('arrived', { statusTimes: { processing: now(), accepted: now(), arrived: now() } });
      await pause(2000);

      // 3. Доставка — їде до клієнта
      onStatusChange?.('running', { statusTimes: { processing: now(), accepted: now(), arrived: now(), running: now() } });
      const routeToDropoff = await buildRoute([pLat, pLng], [dLat, dLng]);
      simRouteCoords.current = routeToDropoff;
      await animate(routeToDropoff, 400);

      // 4. Доставлено
      setCourierPos({ lat: dLat, lng: dLng });
      onStatusChange?.('completed', { statusTimes: { processing: now(), accepted: now(), arrived: now(), running: now(), completed: now() } });

    } catch (e) {
      console.error('[Simulation] error:', e);
    } finally {
      setSimulating(false);
      onSimulationChange?.(false);
    }
  }, [pickup, dropoffs, onStatusChange, onSimulationChange]);

  const stopSimulation = useCallback(() => {
    if (simInterval.current) {
      clearInterval(simInterval.current);
      simInterval.current = null;
    }
    setSimulating(false);
    onSimulationChange?.(false);
    setCourierPos(null);
    // Видалити маркер кур'єра
    if (courierMarker.current && mapInstance.current) {
      mapInstance.current.removeLayer(courierMarker.current);
      courierMarker.current = null;
    }
  }, []);

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  const btnStyle = {
    position: "absolute",
    zIndex: 1000,
    width: 36,
    height: 36,
    borderRadius: 6,
    border: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,.3)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    transition: "all .2s",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 300, borderRadius: 8, overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Кнопка пробки */}
      <button
        onClick={() => setShowTraffic(v => !v)}
        title={showTraffic ? "Сховати пробки" : "Показати пробки"}
        style={{
          ...btnStyle,
          top: 10,
          right: 10,
          background: showTraffic ? "#0597ff" : "#fff",
          color: showTraffic ? "#fff" : "#333",
        }}
      >
        🚦
      </button>

      {/* Кнопка симуляції кур'єра */}


      {/*<button*/}
      {/*  onClick={simulating ? stopSimulation : startSimulation}*/}
      {/*  title={simulating ? "Зупинити симуляцію" : "Симулювати кур'єра"}*/}
      {/*  style={{*/}
      {/*    ...btnStyle,*/}
      {/*    top: 52,*/}
      {/*    right: 10,*/}
      {/*    background: simulating ? "#ef4444" : "#fff",*/}
      {/*    color: simulating ? "#fff" : "#333",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {simulating ? "⏹" : "🚗"}*/}
      {/*</button>*/}
    </div>
  );
};

export default UklonMap;
