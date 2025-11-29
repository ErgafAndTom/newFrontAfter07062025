// ============================================================================
// ReplyPreview.jsx
// Отображение блока "Ответ на сообщение"
// ============================================================================

import React from "react";

export default function ReplyPreview({ reply }) {
  if (!reply) return null;

  const { id, text, mediaPreview } = reply;

  return (
    <div
      style={{
        borderLeft: "3px solid #6aa7ff",
        paddingLeft: 8,
        marginBottom: 4,
        display: "flex",
        gap: 6,
        alignItems: "center"
      }}
    >
      {/* MEDIA PREVIEW */}
      {mediaPreview && (
        <div>
          {mediaPreview.type === "photo" && (
            <div
              style={{
                width: 36,
                height: 36,
                background: "#e0e0e0",
                borderRadius: 4
              }}
            />
          )}

          {mediaPreview.type === "document" && (
            <div
              style={{
                width: 36,
                height: 36,
                background: "#d8e0ff",
                borderRadius: 4
              }}
            />
          )}
        </div>
      )}

      {/* TEXT PREVIEW */}
      <div
        style={{
          fontSize: 13,
          opacity: 0.8,
          lineHeight: "16px",
          maxWidth: "180px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {text || "Сообщение"}
      </div>
    </div>
  );
}
