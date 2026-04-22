import { apiSlice } from '@/store/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<any, string>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'User' as const },
        { type: 'Workspace' as const, id: `MEMBERS-${workspaceId}` }
      ],
    }),
    updateUser: builder.mutation<any, { id: string, fullName?: string, title?: string, mobile?: string, imageUrl?: string }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } = userApi;
