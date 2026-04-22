import { apiSlice } from '@/store/api/apiSlice';

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<any[], { conversationId: string, page?: number, size?: number }>({
      query: ({ conversationId, page = 0, size = 50 }) => ({
        url: `/messages/conversation/${conversationId}`,
        params: { page, size }
      }),
      providesTags: (_result, _error, { conversationId }) => [{ type: 'Message', id: conversationId }],
      transformResponse: (response: any[]) => [...response].reverse(),
    }),
    sendMessage: builder.mutation<any, { content: string, channelId: string, replyToId?: string }>({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: 'Message', id: channelId }],
    }),
    updateMessage: builder.mutation<any, { id: string, content: string, channelId: string }>({
      query: ({ id, content }) => ({
        url: `/messages/${id}`,
        method: 'PUT',
        data: { content },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: 'Message', id: channelId }],
    }),
    deleteMessage: builder.mutation<void, { id: string, channelId: string }>({
      query: ({ id }) => ({
        url: `/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: 'Message', id: channelId }],
    }),
    uploadFiles: builder.mutation<any, { content: string, conversationId: string, files: File[] }>({
      query: ({ content, conversationId, files }) => {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('conversationId', conversationId);
        files.forEach(f => formData.append('files', f));
        return {
          url: '/messages/upload',
          method: 'POST',
          data: formData,
        };
      },
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Message', id: conversationId }],
    }),
    toggleReaction: builder.mutation<any, { messageId: string, emoji: string, channelId: string }>({
      query: ({ messageId, emoji }) => ({
        url: `/messages/${messageId}/react`,
        method: 'POST',
        params: { emoji },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: 'Message', id: channelId }],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useUploadFilesMutation,
  useToggleReactionMutation
} = messageApi;
