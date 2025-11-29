// ============================================================================
// ContactMessage.jsx
// Контакт (имя + телефон)
// ============================================================================

import React from "react";

export default function ContactMessage({ msg }) {
  const c = msg.media?.contact;
  if (!c) return null;

  const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
  const phone = c.phoneNumber;

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.05)",
        maxWidth: 260,
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        {name || "Контакт"}
      </div>

      {phone && (
        <a
          href={`tel:${phone}`}
          style={{ color: "#2B7BB9", fontSize: 14 }}
        >
          {phone}
        </a>
      )}

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Telegram-контакт
      </div>
    </div>
  );
}
