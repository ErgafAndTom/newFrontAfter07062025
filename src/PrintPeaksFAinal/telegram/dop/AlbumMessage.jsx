// ============================================================================
// AlbumMessage.jsx
// Альбом (группированные медиа сообщения)
// ============================================================================

import React, { useState } from "react";
import PhotoMessage from "./PhotoMessage";
import VideoMessage from "./VideoMessage";

export default function AlbumMessage({ msg }) {
  const items = msg.albumItems || [];
  const [zoomItem, setZoomItem] = useState(null);

  if (!items.length) return null;

  // Определяем сетку
  const columns = getColumns(items.length);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "4px",
          width: "100%",
          maxWidth: "320px"
        }}
      >
        {items.map((m, i) => (
          <div
            key={i}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
              maxHeight: "200px"
            }}
            onClick={() => setZoomItem(m)}
          >
            {renderAlbumItem(m)}
          </div>
        ))}
      </div>

      {/* ZOOM VIEW */}
      {zoomItem && (
        <div
          onClick={() => setZoomItem(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out"
          }}
        >
          {zoomItem.mediaType === "photo" && (
            <img
              src={zoomItem.mediaUrl}
              alt=""
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
                borderRadius: 12
              }}
            />
          )}

          {zoomItem.mediaType === "video" && (
            <video
              src={zoomItem.mediaUrl}
              controls
              autoPlay
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
                borderRadius: 12
              }}
            />
          )}
        </div>
      )}
    </>
  );
}



// ============================================================================
// Helpers
// ============================================================================

function renderAlbumItem(m) {
  if (m.mediaType === "photo")
    return (
      <img
        src={m.mediaUrl}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );

  if (m.mediaType === "video")
    return (
      <video
        src={m.mediaUrl}
        muted
        autoPlay
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );

  return null;
}


// Telegram Desktop sets grid:
// 1 item  → 1 column
// 2 items → 2 columns
// 3 items → 3 columns (if landscape)
// 4 items → 2 columns x 2 rows
// 5 items → 3 columns
// 6 items → 3 columns
function getColumns(count) {
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 4) return 2;
  return 3;
}
