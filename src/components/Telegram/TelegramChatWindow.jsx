import React from "react";
import { useSelector } from "react-redux";
import TelegramMessageInput from "./TelegramMessageInput";

export default function TelegramChatWindow() {
  const activeChatId = useSelector(s => s.telegram.activeChatId);
  const messages = useSelector(s =>
    s.telegram.messagesByChat[activeChatId] || []
  );

  return (
    <div className="msg-window">
      <div className="msg-list">
        {messages.map((m, i) => (
          <div key={i} className="msg">
            <b>{m.from}</b>: {m.text}
          </div>
        ))}
      </div>

      <TelegramMessageInput />
    </div>
  );
}
