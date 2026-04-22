import api from '@/lib/api';

export const conversationService = {
  getWorkspaceConversations: async (workspaceId: string) => {
    const response = await api.get(`/conversations/workspace/${workspaceId}`);
    return response.data;
  },
  getConversation: async (id: string) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },
  createConversation: async (data: { name: string, type: string, workspaceId: string }) => {
    const response = await api.post('/conversations', data);
    return response.data;
  },
  getOrCreateDirectConversation: async (workspaceId: string, userId: string) => {
    const response = await api.post(`/conversations/direct?workspaceId=${workspaceId}&userId=${userId}`);
    return response.data;
  },
  addMember: async (conversationId: string, userId: string) => {
    await api.post(`/conversations/${conversationId}/members/${userId}`);
  }
};
