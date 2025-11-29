// ============================================================================
// DocumentMessage.jsx
// Документ (PDF, ZIP, DOCX, любые файлы)
// ============================================================================

import React from "react";

export default function DocumentMessage({ msg }) {
  const doc = msg.media?.document;
  if (!doc) return null;

  const filename = getFileName(doc);
  const size = getFileSize(doc);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.05)"
      }}
    >
      {/* Иконка документа */}
      <div
        style={{
          width: 42,
          height: 52,
          background: "#d3defc",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24
        }}
      >
        📄
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 14,
            maxWidth: "180px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {filename}
        </div>

        {size && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {size}
          </div>
        )}

        {/* Download Link */}
        {msg.mediaUrl && (
          <a
            href={msg.mediaUrl}
            download={filename}
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#2B7BB9"
            }}
          >
            Скачать
          </a>
        )}
      </div>
    </div>
  );
}


// ============================================================
// Helpers
// ============================================================

function getFileName(doc) {
  const attr = doc.attributes?.find(a => a.fileName);
  return attr?.fileName ?? "document";
}

function getFileSize(doc) {
  const size = doc.size;
  if (!size) return null;

  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / 1024 / 1024).toFixed(1) + " MB";
}
