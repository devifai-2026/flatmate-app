import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  messageType: 'user' | 'system';
  text?: string;
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'location';
  mediaUrl?: string;
  location?: { lat: number; lng: number; label?: string };
  status: 'sent' | 'delivered' | 'read';
  readBy?: string[];
  deletedFor?: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profileImage?: string;
  }>;
  isGroup: boolean;
  groupName?: string;
  lastMessage?: {
    text: string;
    sender: string;
    sentAt: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId → messages
  activeConversationId: string | null;
  isConnected: boolean;  // Socket.io connection status
  typingUsers: Record<string, string[]>; // conversationId → userIds typing
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  isConnected: false,
  typingUsers: {},
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },
    updateConversation(state, action: PayloadAction<Conversation>) {
      const idx = state.conversations.findIndex(
        c => c._id === action.payload._id,
      );
      if (idx >= 0) {
        state.conversations[idx] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
    setMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>,
    ) {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    appendMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>,
    ) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    prependMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>,
    ) {
      const { conversationId, messages } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId] = [
        ...messages,
        ...state.messages[conversationId],
      ];
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>,
    ) {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[
          conversationId
        ].filter(id => id !== userId);
      }
    },
    markConversationRead(state, action: PayloadAction<string>) {
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setConversations,
  updateConversation,
  setMessages,
  appendMessage,
  prependMessages,
  setActiveConversation,
  setSocketConnected,
  setTyping,
  markConversationRead,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
