// import React, { useState } from 'react';
// import axios from 'axios';
//
// const TelegramBot = () => {
//     const [message, setMessage] = useState('');
//
//     const sendMessage = async () => {
//         const chatId = '150610497';
//         const text = message;
//         const token = '6343783861:AAHeU_rac1XQkTAeBT3hacvgZ7-c2M-pnJo';
//         const url = `https://api.telegram.org/bot${token}/sendMessage`;
//
//         try {
//             await axios.post(url, {
//                 chat_id: chatId,
//                 text: text,
//             });
//             setMessage('');
//             alert('Повідомлення відправлено!');
//         } catch (error) {
//             console.error('Помилка при відправці повідомлення:', error);
//         }
//     };
//
//     return (
//         <div>
//             <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//             />
//             <button onClick={sendMessage}>Відправити</button>
//         </div>
//     );
// };
//
// export default TelegramBot;

import React, { useState } from 'react';
import axios from 'axios';

const TelegramChat = ({ initialChatId = 1 }) => {
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');

  const TELEGRAM_TOKEN = "6343783861:AAHeU_rac1XQkTAeBT3hacvgZ7-c2M-pnJo"; // 🔥 твій токен
  const TELEGRAM_CHAT = "150610497"; // 🔥 id чату

  // ───────────────────────────────────────────────
  // ВІДПРАВКА У TELEGRAM
  // ───────────────────────────────────────────────
  const getTimestamp = () => {
    return new Date().toISOString();
  };

  const sendTelegram = async (text) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const timestamp = getTimestamp();

    try {
      // Log message
      console.log(`[${timestamp}] Message sent to chat ${TELEGRAM_CHAT}: ${text}`);

      // Send message with metadata
      await axios.post(url, {
        chat_id: TELEGRAM_CHAT,
        text: text,
        metadata: {
          timestamp,
          sender: 'user',
          chatId: chatId
        }
      });

    } catch (err) {
      console.error("❌ Помилка при відправці у Telegram:", err);
    }
  };

  // ───────────────────────────────────────────────
  // ВІДПРАВКА У ЛОКАЛЬНИЙ ЧАТ
  // ───────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // 1) Зберігаємо повідомлення юзера
    const newMessage = {
      id: (messages[chatId]?.length || 0) + 1,
      sender: 'user',
      text: inputValue,
    };

    setMessages({
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage],
    });

    // 2) Відправляємо у Telegram
    sendTelegram(inputValue);

    setInputValue('');

    // 3) Автовідповідь бота (можна прибрати)
    setTimeout(() => {
      const botMessage = {
        id: (messages[chatId]?.length || 0) + 2,
        sender: 'bot',
        text: 'Повідомлення надіслано у Telegram ✔️',
      };
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), botMessage],
      }));
    }, 400);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMessages = messages[chatId] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', backgroundColor: '#f5f5f5' }}>
      {/* Заголовок */}
      <div style={{
        padding: '16px',
        backgroundColor: '#2196F3',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>Чат ID: {chatId}</span>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map((id) => (
            <button
              key={id}
              onClick={() => setChatId(id)}
              style={{
                padding: '6px 12px',
                backgroundColor: chatId === id ? '#1976D2' : '#fff',
                color: chatId === id ? '#fff' : '#2196F3',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: chatId === id ? 'bold' : 'normal',
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Повідомлення */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {currentMessages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '60%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: message.sender === 'user' ? '#2196F3' : '#e0e0e0',
                color: message.sender === 'user' ? '#fff' : '#000',
                wordWrap: 'break-word',
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Поле написання */}
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '8px',
      }}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напишіть повідомлення..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'Arial',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          Надіслати
        </button>
      </div>
    </div>
  );
};

export default TelegramChat;
