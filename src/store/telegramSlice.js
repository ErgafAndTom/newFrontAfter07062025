// store/telegramSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ========== Загрузка чатов ==========
export const fetchChats = createAsyncThunk(
  'tg/fetchChats',
  async () => {
    const res = await axios.get('/tg/chats');
    return res.data.data;
  }
);

// ========== Загрузка сообщений ==========
export const fetchMessages = createAsyncThunk(
  'tg/fetchMessages',
  async (chatId) => {
    const res = await axios.get(`/tg/messages/${chatId}`);
    return { chatId, messages: res.data.data };
  }
);

// ========== Отправка сообщения ==========
export const sendTGMessage = createAsyncThunk(
  'tg/sendMessage',
  async ({ chatId, text }) => {
    await axios.post('/tg/send', { chatId, text });
    return { chatId, text };
  }
);

const telegramSlice = createSlice({
  name: 'telegram',
  initialState: {
    chats: [],
    messages: {}, // messages[chatId] = []
    activeChat: null
  },

  reducers: {
    // Пришло новое сообщение по WebSocket
    pushIncomingMessage: (state, action) => {
      const { chatId, message } = action.payload;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId].push(message);

      // поднимаем чат наверх
      const index = state.chats.findIndex(c => c.chatId === chatId);
      if (index !== -1) {
        const chat = state.chats.splice(index, 1)[0];
        state.chats.unshift(chat);
      }
    },

    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.chats = action.payload;
    });

    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    });

    builder.addCase(sendTGMessage.fulfilled, (state, action) => {
      const { chatId, text } = action.payload;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId].push({
        text,
        direction: 'outgoing',
        timestamp: Math.floor(Date.now() / 1000)
      });
    });
  }
});

export const { pushIncomingMessage, setActiveChat } = telegramSlice.actions;
export default telegramSlice.reducer;
