import { apiClient } from './api.client';
import { Endpoints } from './api.endpoints';
import { Conversation, Message } from '../Redux/Slices/chatSlice';

export const ChatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await apiClient.get<{ conversations: Conversation[] }>(
      Endpoints.chat.conversations,
    );
    return data.conversations;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await apiClient.get<{ messages: Message[] }>(
      Endpoints.chat.messages(conversationId),
    );
    return data.messages;
  },

  sendMessage: async (
    conversationId: string,
    payload: {
      text?: string;
      mediaType?: Message['mediaType'];
      mediaUrl?: string;
      location?: { lat: number; lng: number; label?: string };
    },
  ): Promise<Message> => {
    const { data } = await apiClient.post<{ message: Message }>(
      Endpoints.chat.sendMessage(conversationId),
      payload,
    );
    return data.message;
  },

  markRead: async (conversationId: string): Promise<void> => {
    await apiClient.put(Endpoints.chat.markRead(conversationId));
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(Endpoints.chat.deleteMessage(messageId));
  },

  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post(Endpoints.chat.block, { userId });
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post(Endpoints.chat.unblock, { userId });
  },
};
