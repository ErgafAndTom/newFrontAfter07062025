import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../components/Telegram/telegram.api";

// ====== API ======
export const fetchChats = createAsyncThunk(
  "telegram/fetchChats",
  async () => (await api.get("/chats")).data
);

export const fetchChatMessages = createAsyncThunk(
  "telegram/fetchChatMessages",
  async (chatId) => ({
    chatId,
    messages: (await api.get(`/chat/${chatId}`)).data
  })
);

export const sendTelegramMessage = createAsyncThunk(
  "telegram/sendTelegramMessage",
  async ({ chatId, text }) => {
    await api.post("/messages/send", { chatId, text });
    return {
      chatId,
      messages: (await api.get(`/chat/${chatId}`)).data
    };
  }
);

// ====== Slice ======
const telegramSlice = createSlice({
  name: "telegram",
  initialState: {
    chats: [],
    chatsLoading: false,
    messagesByChat: {},
    activeChatId: null,
    unreadByChat: {},
    totalUnread: 0,
    drawerOpen: false
  },

  reducers: {
    setActiveChatId(state, action) {
      const id = action.payload;
      state.activeChatId = id;

      const unread = state.unreadByChat[id] || 0;
      state.totalUnread = Math.max(0, state.totalUnread - unread);
      state.unreadByChat[id] = 0;
    },

    openDrawer(state) { state.drawerOpen = true; },
    closeDrawer(state) { state.drawerOpen = false; },

    newIncomingMessage(state, action) {
      const { chatId, message } = action.payload;

      if (!state.messagesByChat[chatId])
        state.messagesByChat[chatId] = [];

      state.messagesByChat[chatId].push(message);

      if (!state.drawerOpen || state.activeChatId !== chatId) {
        if (!state.unreadByChat[chatId]) state.unreadByChat[chatId] = 0;
        state.unreadByChat[chatId] += 1;
        state.totalUnread += 1;
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => { state.chatsLoading = true; })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chatsLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messagesByChat[chatId] = messages;
      })
      .addCase(sendTelegramMessage.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messagesByChat[chatId] = messages;
      });
  },
});

export const {
  openDrawer,
  closeDrawer,
  setActiveChatId,
  newIncomingMessage
} = telegramSlice.actions;

export default telegramSlice.reducer;
