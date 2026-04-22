import { apiSlice } from '@/store/api/apiSlice';

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceConversations: builder.query<any[], string>({
      query: (workspaceId) => ({ url: `conversations/workspace/${workspaceId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Conversation', id: `LIST-${id}` }],
    }),
    getConversation: builder.query<any, string>({
      query: (id) => ({ url: `conversations/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Conversation', id }],
    }),
    createConversation: builder.mutation<any, any>({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: 'Conversation', id: `LIST-${workspaceId}` }],
    }),
    getOrCreateDirect: builder.mutation<any, { workspaceId: string, userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/conversations/direct`,
        method: 'POST',
        params: { workspaceId, userId }
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: 'Conversation', id: `LIST-${workspaceId}` }],
    }),
    addMemberToConversation: builder.mutation<void, { conversationId: string, userId: string }>({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/members/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Conversation', id: conversationId }],
    }),
    removeMemberFromConversation: builder.mutation<void, { conversationId: string, userId: string }>({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Conversation', id: conversationId }],
    }),
    deleteConversation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversation'],
    }),
    updateConversation: builder.mutation<any, { id: string, name: string, type: string }>({
      query: ({ id, ...data }) => ({
        url: `/conversations/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Conversation', id }],
    }),
    resetUnreadCount: builder.mutation<void, { conversationId: string, workspaceId: string }>({
      query: ({ conversationId }) => ({
        url: `/conversations/${conversationId}/reset-unread-count`,
        method: 'POST',
      }),
      async onQueryStarted({ conversationId, workspaceId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          conversationApi.util.updateQueryData('getWorkspaceConversations', workspaceId, (draft) => {
            const convo = draft.find(c => c.id === conversationId);
            if (convo) convo.unreadCount = 0;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),



  }),
});

export const {
  useGetWorkspaceConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetOrCreateDirectMutation,
  useAddMemberToConversationMutation,
  useRemoveMemberFromConversationMutation,
  useDeleteConversationMutation,
  useUpdateConversationMutation,
  useResetUnreadCountMutation
} = conversationApi;

