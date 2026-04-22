import { apiSlice } from '@/store/api/apiSlice';

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any[], void>({
      query: () => ({ url: '/notifications', method: 'GET' }),
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.find((n) => n.id === id);
            if (notification) notification.isRead = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft.forEach((n) => {
              n.isRead = true;
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    clearAll: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/clear-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useClearAllMutation,
} = notificationApi;
