// ============================================================================
// ForwardHeader.jsx
// Отображение информации о пересланном сообщении
// ============================================================================

import React from "react";

export default function ForwardHeader({ forward }) {
  if (!forward) return null;

  const from =
    forward.fromName ||
    forward.fromChat ||
    "Unknown source";

  return (
    <div
      style={{
        fontSize: 12,
        opacity: 0.65,
        marginBottom: 2,
        borderLeft: "2px solid #6aa7ff",
        paddingLeft: 6
      }}
    >
      Переслано от {from}
    </div>
  );
}
