// ============================================================================
// VideoMessage.jsx
// ============================================================================

import React from "react";

export default function VideoMessage({ msg }) {
  if (!msg.mediaUrl)
    return (
      <div
        style={{
          width: 260,
          height: 200,
          background: "#e5e5e5",
          borderRadius: 10
        }}
      />
    );

  return (
    <video
      src={msg.mediaUrl}
      controls
      preload="metadata"
      style={{
        maxWidth: "260px",
        maxHeight: "420px",
        borderRadius: 12,
        background: "#000"
      }}
    />
  );
}
