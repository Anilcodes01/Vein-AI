import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@/lib/types";

interface ChatState {
  chat: ChatMessage[];
  loading: boolean;
}

const initialState: ChatState = {
  chat: [],
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.chat.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetChat(state) {
      state.chat = [];
    },
  },
});

export const { addMessage, setLoading, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
