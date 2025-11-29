// ============================================================================
// PollMessage.jsx
// Опрос (poll)
// ============================================================================

import React from "react";

export default function PollMessage({ msg }) {
  const poll = msg.media?.poll;
  if (!poll) return null;

  const question = poll.question;
  const answers = poll.answers ?? [];
  const closed = poll.closed;

  const totalVotes = answers.reduce(
    (sum, a) => sum + (a.voters ?? 0),
    0
  );

  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div style={{ fontWeight: 600 }}>{question}</div>

      {answers.map((a, i) => {
        const count = a.voters ?? 0;
        const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            <div style={{ fontSize: 14 }}>{a.text}</div>

            <div
              style={{
                width: "100%",
                background: "#eaeaea",
                height: 6,
                borderRadius: 3,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: pct + "%",
                  height: "100%",
                  background: "#8bb8ff"
                }}
              />
            </div>

            {closed && (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.65
                }}
              >
                {count} голосов ({pct.toFixed(1)}%)
              </div>
            )}
          </div>
        );
      })}

      {closed && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.55
          }}
        >
          Голосование завершено
        </div>
      )}
    </div>
  );
}
