// ============================================================================
// ServiceMessage.jsx
// Системные служебные сообщения Telegram
// ============================================================================

import React from "react";

export default function ServiceMessage({ msg }) {
  const text = detectServiceText(msg);
  if (!text) return null;

  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        margin: "8px 0",
        opacity: 0.7,
        fontSize: 13
      }}
    >
      {text}
    </div>
  );
}



function detectServiceText(msg) {
  const raw = msg.raw;

  if (!raw) return null;

  const cls = raw.className || raw._;

  if (cls === "MessageService") {
    const action = raw.action;

    if (!action) return null;

    const actType = action.className;

    switch (actType) {
      case "MessageActionChatEditTitle":
        return `Название чата изменено: "${action.title}"`;

      case "MessageActionChatEditPhoto":
        return "Фотография чата изменена";

      case "MessageActionChatAddUser":
        return `Пользователь добавлен: ${action.users?.join(", ")}`;

      case "MessageActionChatDeleteUser":
        return `Пользователь покинул чат: ${action.userId}`;

      case "MessageActionChatJoinedByLink":
        return "Вошёл по ссылке-приглашению";

      case "MessageActionChatDeletePhoto":
        return "Фото чата удалено";

      case "MessageActionPinMessage":
        return "Сообщение закреплено";

      case "MessageActionHistoryClear":
        return "История очищена";

      case "MessageActionChatCreate":
        return `Создан чат: ${action.title}`;

      case "MessageActionChatMigrateTo":
        return "Чат перенесён в супергруппу";

      case "MessageActionChannelCreate":
        return `Создан канал: ${action.title}`;
    }
  }

  return null;
}
