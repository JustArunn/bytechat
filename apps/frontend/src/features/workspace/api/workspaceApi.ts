import { apiSlice } from '@/store/api/apiSlice';

export const workspaceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<any[], void>({
      query: () => ({ url: '/workspaces' }),
      providesTags: ['Workspace'],
    }),
    getWorkspace: builder.query<any, string>({
      query: (id) => ({ url: `/workspaces/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Workspace', id }],
    }),
    getPublicWorkspace: builder.query<any, string>({
      query: (id) => ({ url: `/workspaces/public/${id}` }),
    }),
    checkSlugAvailability: builder.query<boolean, string>({
      query: (slug) => ({
        url: '/workspaces/check-slug',
        params: { slug }
      }),
    }),
    createWorkspace: builder.mutation<any, { name: string, slug: string }>({
      query: (data) => ({
        url: '/workspaces',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Workspace'],
    }),
    joinWorkspace: builder.mutation<any, string>({
      query: (joinCode) => ({
        url: `/workspaces/join/${joinCode}`,
        method: 'POST',
      }),
      invalidatesTags: ['Workspace'],
    }),
    getWorkspaceMembers: builder.query<any[], string>({
      query: (workspaceId) => ({ url: `/workspaces/${workspaceId}/members` }),
      providesTags: (_result, _error, id) => [{ type: 'Workspace', id: `MEMBERS-${id}` }],
    }),
    addCoAdmin: builder.mutation<any, { workspaceId: string, userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/co-admins/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }, { type: 'Workspace', id: `MEMBERS-${workspaceId}` }],
    }),
    removeCoAdmin: builder.mutation<any, { workspaceId: string, userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/co-admins/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }, { type: 'Workspace', id: `MEMBERS-${workspaceId}` }],
    }),
    inviteMember: builder.mutation<void, { workspaceId: string, email: string }>({
      query: ({ workspaceId, email }) => ({
        url: `/workspaces/${workspaceId}/invite`,
        method: 'POST',
        params: { email },
      }),
    }),
    getInvites: builder.query<any[], void>({
      query: () => ({ url: '/workspaces/invites' }),
      providesTags: ['Workspace'],
    }),
    acceptInvite: builder.mutation<any, string>({
      query: (inviteId) => ({
        url: `/workspaces/invites/${inviteId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Workspace'],
    }),
    acceptInviteBySlug: builder.mutation<any, string>({
      query: (slug) => ({
        url: `/workspaces/invites/accept-by-slug`,
        method: 'POST',
        params: { slug }
      }),
      invalidatesTags: ['Workspace'],
    }),
  }),
});


export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useGetPublicWorkspaceQuery,
  useCheckSlugAvailabilityQuery,
  useCreateWorkspaceMutation,
  useJoinWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useAddCoAdminMutation,
  useRemoveCoAdminMutation,
  useInviteMemberMutation,
  useGetInvitesQuery,
  useAcceptInviteMutation,
  useAcceptInviteBySlugMutation
} = workspaceApi;

