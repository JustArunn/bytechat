import { apiSlice } from "@/store/api/apiSlice";

export interface SearchResultUser {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string;
}

export interface SearchResultChannel {
  id: string;
  name: string;
  type: string;
}

export interface SearchResultMessage {
  id: string;
  content: string;
  senderName: string;
  conversationId: string;
  conversationName: string;
  timestamp: string;
}

export interface SearchResponse {
  users: SearchResultUser[];
  channels: SearchResultChannel[];
  messages: SearchResultMessage[];
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<SearchResponse, { workspaceId: string; query: string }>({
      query: ({ workspaceId, query }) => ({
        url: `/search`,
        params: { workspaceId, query },
      }),
    }),
  }),
});

export const { useSearchQuery, useLazySearchQuery } = searchApi;
