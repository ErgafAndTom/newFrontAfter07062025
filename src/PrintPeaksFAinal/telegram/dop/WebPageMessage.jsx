// ============================================================================
// WebPageMessage.jsx
// Превью веб-страницы (link preview)
// ============================================================================

import React from "react";

export default function WebPageMessage({ msg }) {
  const wp = msg.media?.webPage;
  const title = wp?.title;
  const desc = wp?.description;
  const url = wp?.url;

  const hasPhoto = msg.mediaType === "webpage-photo" || msg.mediaType === "webpage-video";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    >
      {hasPhoto && msg.mediaUrl && (
        <img
          src={msg.mediaUrl}
          alt=""
          style={{
            width: "100%",
            maxHeight: 260,
            objectFit: "cover"
          }}
        />
      )}

      <div style={{ padding: "8px 10px" }}>
        {title && (
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 4
            }}
          >
            {title}
          </div>
        )}

        {desc && (
          <div
            style={{
              fontSize: 13,
              opacity: 0.8,
              marginBottom: 6,
              lineHeight: "16px"
            }}
          >
            {desc}
          </div>
        )}

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: "#337ab7"
            }}
          >
            {url}
          </a>
        )}
      </div>
    </div>
  );
}
