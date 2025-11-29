// ============================================================================
// PhotoMessage.jsx
// ============================================================================

import React, { useState } from "react";

export default function PhotoMessage({ msg }) {
  const [zoom, setZoom] = useState(false);

  if (!msg.mediaUrl)
    return (
      <div
        style={{
          width: 240,
          height: 240,
          background: "#e8e8e8",
          borderRadius: 10
        }}
      />
    );

  return (
    <>
      <img
        src={msg.mediaUrl}
        style={{
          maxWidth: "260px",
          maxHeight: "420px",
          borderRadius: 12,
          cursor: "pointer",
          objectFit: "cover"
        }}
        onClick={() => setZoom(true)}
        alt=""
      />

      {zoom && (
        <div
          onClick={() => setZoom(false)}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <img
            src={msg.mediaUrl}
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              borderRadius: 12
            }}
            alt=""
          />
        </div>
      )}
    </>
  );
}
