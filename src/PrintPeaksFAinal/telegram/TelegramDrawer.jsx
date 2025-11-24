// components/TelegramDrawer.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import {
  fetchChats,
  fetchMessages,
  sendTGMessage,
  pushIncomingMessage,
  setActiveChat
} from '../../store/telegramSlice';

const socket = io(process.env.REACT_APP_API_URL);

export default function TelegramDrawer() {
  const dispatch = useDispatch();

  const chats = useSelector(state => state.telegram.chats);
  const messages = useSelector(state => state.telegram.messages);
  const activeChat = useSelector(state => state.telegram.activeChat);

  const [text, setText] = useState('');

  // Инициализация WebSocket
  useEffect(() => {
    socket.on('tg_message', (data) => {
      dispatch(pushIncomingMessage(data));
    });

    return () => {
      socket.off('tg_message');
    };
  }, [dispatch]);

  // Первичная загрузка чатов
  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Загрузка сообщений выбранного чата
  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat));
    }
  }, [activeChat, dispatch]);

  const send = () => {
    if (!text.trim() || !activeChat) return;

    dispatch(sendTGMessage({ chatId: activeChat, text }));
    setText('');
  };

  return (
    <div className="tg-drawer">

      {/* ==== ЛЕВАЯ ПАНЕЛЬ: чаты ==== */}
      <div className="tg-chats">
        {chats.map(chat => (
          <div
            key={chat.chatId}
            className={`tg-chat-item ${activeChat === chat.chatId ? 'active' : ''}`}
            onClick={() => dispatch(setActiveChat(chat.chatId))}
          >
            {chat.title || chat.username || chat.chatId}
          </div>
        ))}
      </div>

      {/* ==== ПРАВАЯ ПАНЕЛЬ: сообщения ==== */}
      <div className="tg-messages">
        <div className="tg-messages-list">
          {(messages[activeChat] || []).map((m, idx) => (
            <div
              key={idx}
              className={`tg-message ${m.direction === 'incoming' ? 'in' : 'out'}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* ==== Ввод ==== */}
        <div className="tg-input">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Написать сообщение..."
          />
          <button onClick={send}>➤</button>
        </div>
      </div>
    </div>
  );
}
