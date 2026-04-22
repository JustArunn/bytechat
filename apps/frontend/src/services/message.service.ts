import api from '@/lib/api';

export const messageService = {
  getMessages: async (conversationId: string, page = 0, size = 50) => {
    const response = await api.get(`/messages/conversation/${conversationId}?page=${page}&size=${size}`);
    return response.data;
  },
  sendMessage: async (data: { content: string, channelId: string }) => {
    const response = await api.post('/messages', data);
    return response.data;
  },
  uploadFiles: async (content: string, conversationId: string, files: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('conversationId', conversationId);
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
