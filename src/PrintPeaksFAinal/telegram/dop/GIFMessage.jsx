// ============================================================================
// GIFMessage.jsx
// Анимированный GIF (на самом деле MP4)
// ============================================================================

import React, { useRef } from "react";

export default function GIFMessage({ msg }) {
  const ref = useRef(null);

  if (!msg.mediaUrl)
    return (
      <div
        style={{
          width: 240,
          height: 240,
          background: "#e5e5e5",
          borderRadius: 12
        }}
      />
    );

  return (
    <video
      ref={ref}
      src={msg.mediaUrl}
      autoPlay
      loop
      muted
      playsInline
      style={{
        maxWidth: "260px",
        maxHeight: "420px",
        borderRadius: 12
      }}
      onMouseEnter={() => ref.current && ref.current.play()}
      onMouseLeave={() => ref.current && ref.current.pause()}
    />
  );
}
