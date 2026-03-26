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
  const routeLine = useRef(null);
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
      .bindPopup(`<b>Забір</b>`);

    // Dropoff markers
    const points = [[pLat, pLng]];
    dropoffs.forEach((d, i) => {
      const dLat = parseFloat(d?.lat);
      const dLng = parseFloat(d?.lng);
      if (!dLat || !dLng) return;
      L.marker([dLat, dLng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(`<b>Доставка ${dropoffs.length > 1 ? i + 1 : ""}</b>`);
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

  // Polling позиції кур'єра
  const pollCourier = useCallback(async () => {
    if (!deliveryId) return;
    try {
      const { data } = await axios.get(`/api/uklon/order/${deliveryId}/courier`);
      if (data?.latitude && data?.longitude) {
        setCourierPos({ lat: data.latitude, lng: data.longitude });
        onCourierUpdate?.(data);
      }
    } catch {
      // Courier position not available yet
    }
  }, [deliveryId, onCourierUpdate]);

  useEffect(() => {
    if (simulating) return; // Не polling під час симуляції
    // Polling позиції кур'єра тільки коли водій вже призначений
    // processing/created — водія ще шукають, нема кого відстежувати
    const courierActiveStatuses = ["driver_found", "driver_on_way", "driver_arrived", "on_place", "parcel_picked_up", "picked_up", "delivering"];
    if (!courierActiveStatuses.includes((status || "").toLowerCase())) return;

    console.log('%c[Uklon:FE:Map] 🚗 Courier polling started, status:', 'color: #0e935b', status);
    pollCourier();
    const interval = setInterval(pollCourier, 10000); // кожні 10с
    return () => clearInterval(interval);
  }, [status, pollCourier, simulating]);

  // Оновити маркер кур'єра на карті
  useEffect(() => {
    if (!mapInstance.current || !courierPos?.lat || !courierPos?.lng) return;

    const pos = [courierPos.lat, courierPos.lng];

    if (courierMarker.current) {
      courierMarker.current.setLatLng(pos);
    } else {
      courierMarker.current = L.marker(pos, { icon: courierIcon, zIndexOffset: 1000 })
        .addTo(mapInstance.current)
        .bindPopup("<b>Кур'єр</b>");
    }

    // Оновити маршрут: показати залишок маршруту від кур'єра
    if (routeLine.current && simRouteCoords.current.length > 2) {
      // Знайти найближчу точку на маршруті
      let minDist = Infinity, minIdx = 0;
      simRouteCoords.current.forEach((p, i) => {
        const d = (p[0] - pos[0]) ** 2 + (p[1] - pos[1]) ** 2;
        if (d < minDist) { minDist = d; minIdx = i; }
      });
      // Залишок маршруту від кур'єра до кінця
      const remaining = [pos, ...simRouteCoords.current.slice(minIdx + 1)];
      routeLine.current.setLatLngs(remaining);
    } else if (routeLine.current && dropoffs?.[0]) {
      const dLat = parseFloat(dropoffs[0]?.lat);
      const dLng = parseFloat(dropoffs[0]?.lng);
      if (dLat && dLng) {
        routeLine.current.setLatLngs([pos, [dLat, dLng]]);
      }
    }
  }, [courierPos, dropoffs]);

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

      // 1. Водій знайдений
      onStatusChange?.('driver_found', { statusTimes: { processing: now(), driver_found: now() } });
      setCourierPos({ lat: startLat, lng: startLng });
      await pause(1500);

      // 2. Водій їде до забору
      onStatusChange?.('driver_on_way', { statusTimes: { created: now(), driver_found: now(), driver_on_way: now() } });
      const routeToPickup = await buildRoute([startLat, startLng], [pLat, pLng]);
      simRouteCoords.current = routeToPickup;
      await animate(routeToPickup, 400);

      // 3. Водій прибув до забору
      setCourierPos({ lat: pLat, lng: pLng });
      onStatusChange?.('driver_arrived', { statusTimes: { created: now(), driver_found: now(), driver_on_way: now(), driver_arrived: now() } });
      await pause(2000);

      // 4. Посилку забрано
      onStatusChange?.('parcel_picked_up', { statusTimes: { created: now(), driver_found: now(), driver_on_way: now(), driver_arrived: now(), parcel_picked_up: now() } });
      await pause(1500);

      // 5. Доставляється — їде до клієнта
      onStatusChange?.('delivering', { statusTimes: { created: now(), driver_found: now(), driver_on_way: now(), driver_arrived: now(), parcel_picked_up: now(), delivering: now() } });
      const routeToDropoff = await buildRoute([pLat, pLng], [dLat, dLng]);
      simRouteCoords.current = routeToDropoff;
      await animate(routeToDropoff, 400);

      // 6. Доставлено
      setCourierPos({ lat: dLat, lng: dLng });
      onStatusChange?.('delivered', { statusTimes: { created: now(), driver_found: now(), driver_on_way: now(), driver_arrived: now(), parcel_picked_up: now(), delivering: now(), delivered: now() } });

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
      <button
        onClick={simulating ? stopSimulation : startSimulation}
        title={simulating ? "Зупинити симуляцію" : "Симулювати кур'єра"}
        style={{
          ...btnStyle,
          top: 52,
          right: 10,
          background: simulating ? "#ef4444" : "#fff",
          color: simulating ? "#fff" : "#333",
        }}
      >
        {simulating ? "⏹" : "🚗"}
      </button>
    </div>
  );
};

export default UklonMap;
