// ============================================================================
// EditedLabel.jsx
// Малая подпись "ред." со временем
// ============================================================================

import React from "react";

export default function EditedLabel({ time }) {
  if (!time) return null;

  const t = format(time);

  return (
    <span style={{ opacity: 0.7, fontSize: 11 }}>
      ред.{t}
    </span>
  );
}

function format(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
