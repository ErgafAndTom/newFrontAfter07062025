import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchChatMessages,
  sendTelegramMessage,
} from "../../telegram/telegramSlice";
import api from "./telegram.api";

export default function TelegramChat({ chat, messages }) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (chat?.id) {
      dispatch(fetchChatMessages(chat.id));
    }
  }, [chat?.id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async () => {
    if (!text.trim()) return;
    await dispatch(sendTelegramMessage({ chatId: chat.id, text }));
    setText("");
  };

  const addClient = async () => {
    await api.post("/telegram/add-client", { telegramUser: chat });
    alert("Клієнта додано!");
  };

  return (
    <div className="tgChatWindow">
      <div className="tgChatHeaderBottom">
        <div className="tgChatTitleBig">
          {chat.first_name} {chat.last_name}
          <div className="tgChatSub">@{chat.username}</div>
        </div>
        <button className="addClientBtn" onClick={addClient}>
          Додати клієнта
        </button>
      </div>

      <div className="tgMessages">
        {messages.map((m) => (
          <div key={m.id} className={`tgMsg ${m.direction}`}>
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="tgInputBlock">
        <input
          className="tgInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Повідомлення..."
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <button className="sendBtn" onClick={onSend}>
          ➤
        </button>
      </div>
    </div>
  );
}
