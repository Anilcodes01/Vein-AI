// src/store/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/lib/types'; // Adjust path if needed

interface ChatState {
  chat: ChatMessage[];
  loading: boolean;
  currentChatId: string | null; // Track the ID of the loaded chat
}

const initialState: ChatState = {
  chat: [], // Start with an empty chat array
  loading: false,
  currentChatId: null, // Initially no chat is loaded
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chat.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Action to replace the entire chat state (messages and ID)
    setChat: (state, action: PayloadAction<{ messages: ChatMessage[], chatId: string | null }>) => {
      state.chat = action.payload.messages;
      state.currentChatId = action.payload.chatId;
      state.loading = false; // Ensure loading is reset when chat is set
    },
    // Action specifically to clear the chat for a new one
    clearChat: (state) => {
      state.chat = [];
      state.currentChatId = null;
      state.loading = false;
    }
  },
});

// Export actions including the new one
export const { addMessage, setLoading, setChat, clearChat } = chatSlice.actions;
export default chatSlice.reducer;

// Remember to update RootState in your main store file (e.g., src/store/index.ts)
// import { configureStore } from '@reduxjs/toolkit';
// import chatReducer from './chatSlice';
// export const store = configureStore({ reducer: { chat: chatReducer } });
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;