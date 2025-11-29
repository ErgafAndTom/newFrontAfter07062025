// ============================================================================
// VoiceMessage.jsx
// Голосовое сообщение
// ============================================================================

import React, { useRef, useState } from "react";

export default function VoiceMessage({ msg }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 0",
        gap: 10
      }}
    >
      {/* Play Button */}
      <div
        onClick={togglePlay}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#6aa7ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          cursor: "pointer",
          fontSize: playing ? 16 : 18,
          userSelect: "none"
        }}
      >
        {playing ? "❚❚" : "▶"}
      </div>

      {/* Waveform stub */}
      <div
        style={{
          width: 140,
          height: 24,
          background: "linear-gradient(90deg, #aacaff 0%, #e2eaff 100%)",
          borderRadius: 6,
          opacity: 0.85
        }}
      />

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={msg.mediaUrl}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
    </div>
  );
}
