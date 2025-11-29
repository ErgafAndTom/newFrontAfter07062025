// ============================================================================
// StickerMessage.jsx
// Telegram Sticker (static webp / animated webm)
// ============================================================================

import React from "react";

export default function StickerMessage({ msg }) {
  if (!msg.mediaUrl)
    return (
      <div
        style={{
          width: 160,
          height: 160,
          background: "#ececec",
          borderRadius: 12
        }}
      />
    );

  const isAnimated =
    msg.media?.document?.mimeType === "video/webm" ||
    msg.media?.document?.mimeType === "video/mp4";

  return (
    <div
      style={{
        maxWidth: 200,
        maxHeight: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {isAnimated ? (
        <video
          src={msg.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "150px",
            height: "150px",
            objectFit: "contain"
          }}
        />
      ) : (
        <img
          src={msg.mediaUrl}
          alt=""
          style={{
            width: "150px",
            height: "150px",
            objectFit: "contain"
          }}
        />
      )}
    </div>
  );
}
