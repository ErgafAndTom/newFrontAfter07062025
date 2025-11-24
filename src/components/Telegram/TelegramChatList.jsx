import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import React from "react";

import { setActiveChatId } from "../../telegram/telegramSlice";
export default function TelegramChatList() {
  const dispatch = useDispatch();
  const chats = useSelector(s => s.telegram?.chats || []);
  const unread = useSelector(s => s.telegram?.unreadByChat || {});
  return (
    <div className="chat-list">
      {chats.map(c => (
        <div
          key={c.id}
          onClick={() => dispatch(setActiveChatId(c.id))}
          className="chat-item"
        >
          <span>{c.title}</span>

          {!!unread[c.id] && (
            <span className="badge">{unread[c.id]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
