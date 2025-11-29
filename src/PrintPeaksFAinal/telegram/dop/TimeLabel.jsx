// ============================================================================
// TimeLabel.jsx
// Метка времени сообщения
// ============================================================================

import React from "react";

export default function TimeLabel({ time }) {
  if (!time) return null;

  const t = format(time);

  return (
    <span style={{ opacity: 0.55, fontSize: 11 }}>
      {t}
    </span>
  );
}

function format(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
