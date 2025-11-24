import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendTelegramMessage } from "../../telegram/telegramSlice";

export default function TelegramMessageInput() {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const chatId = useSelector(s => s.telegram.activeChatId);

  function send() {
    if (!chatId || !text.trim()) return;
    dispatch(sendTelegramMessage({ chatId, text }));
    setText("");
  }

  return (
    <div className="msg-input">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
