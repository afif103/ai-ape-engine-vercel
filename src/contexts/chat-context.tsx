import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Conversation,
  ConversationWithMessages,
  ChatState,
  Message
} from '@/types/api';
import { apiClient } from '@/lib/api';

interface ChatStore extends ChatState {
  // Actions
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      error: null,

      loadConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getConversations();
          set({
            conversations: response.data,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to load conversations'
          });
        }
      },

      createConversation: async (title?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.createConversation(title);
          const newConversation = response.data;

          // Add to conversations list
          const { conversations } = get();
          set({
            conversations: [newConversation, ...conversations],
            currentConversation: { ...newConversation, messages: [], token_stats: { input_tokens: 0, output_tokens: 0, total_tokens: 0, message_count: 0 } },
            isLoading: false
          });

          return newConversation;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to create conversation'
          });
          throw error;
        }
      },

      selectConversation: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getConversation(conversationId);
          set({
            currentConversation: response.data,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to load conversation'
          });
        }
      },

      sendMessage: async (conversationId: string, content: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.sendMessage(conversationId, content);
          const newMessage = response.data.message;

          // Update current conversation
          const { currentConversation } = get();
          if (currentConversation && currentConversation.id === conversationId) {
            const updatedConversation = {
              ...currentConversation,
              messages: [...currentConversation.messages, newMessage],
              token_stats: {
                ...currentConversation.token_stats,
                input_tokens: currentConversation.token_stats.input_tokens + newMessage.input_tokens,
                output_tokens: currentConversation.token_stats.output_tokens + newMessage.output_tokens,
                total_tokens: currentConversation.token_stats.total_tokens + newMessage.input_tokens + newMessage.output_tokens,
                message_count: currentConversation.token_stats.message_count + 1
              }
            };
            set({ currentConversation: updatedConversation });
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to send message'
          });
          throw error;
        }
      },

      deleteConversation: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteConversation(conversationId);

          // Remove from conversations list
          const { conversations, currentConversation } = get();
          const updatedConversations = conversations.filter(c => c.id !== conversationId);

          set({
            conversations: updatedConversations,
            currentConversation: currentConversation?.id === conversationId ? null : currentConversation,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to delete conversation'
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversation: state.currentConversation
      })
    }
  )
);