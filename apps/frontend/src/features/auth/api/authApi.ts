import { apiSlice } from '@/store/api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<any, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['User'],
    }),
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User', 'Workspace'],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.upsertQueryData('getMe', undefined, data)
          );
        } catch {}
      },
    }),
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        data: data,
      }),
      invalidatesTags: ['User', 'Workspace'],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.upsertQueryData('getMe', undefined, data)
          );
        } catch {}
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.util.upsertQueryData('getMe', undefined, null)
          );
        } catch {}
      },
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation, useRegisterMutation } = authApi;
