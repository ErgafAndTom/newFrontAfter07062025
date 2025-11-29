// ============================================================================
// ReactionBar.jsx
// Плашка реакций под сообщением
// ============================================================================

import React from "react";

export default function ReactionBar({ reactions }) {
  if (!reactions?.results || reactions.results.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        marginTop: 4,
        flexWrap: "wrap"
      }}
    >
      {reactions.results.map((r, i) => {
        const emoji = r.reaction?.emoticon;
        const count = r.count;

        if (!emoji) return null;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "rgba(130,130,130,0.12)",
              borderRadius: 10,
              padding: "2px 6px",
            }}
          >
            <span style={{ fontSize: 16 }}>{emoji}</span>
            {count > 1 && (
              <span style={{ fontSize: 13, opacity: 0.8 }}>
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
