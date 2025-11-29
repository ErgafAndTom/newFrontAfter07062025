// ============================================================================
// LocationMessage.jsx
// Сообщение с геолокацией
// ============================================================================

import React from "react";

export default function LocationMessage({ msg }) {
  const geo = msg.media?.geo;
  if (!geo) return null;

  const lat = geo.lat;
  const lon = geo.long;

  const previewUrl = `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=450,260&z=14&l=map&pt=${lon},${lat},pm2rdm`;

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.1)",
        maxWidth: 300
      }}
    >
      <img
        src={previewUrl}
        alt="map"
        style={{ width: "100%", height: "auto" }}
      />

      <div style={{ padding: "6px 10px", fontSize: 13 }}>
        Геопозиция: {lat.toFixed(5)}, {lon.toFixed(5)}
      </div>
    </div>
  );
}
