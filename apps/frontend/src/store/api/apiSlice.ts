import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User', 'Workspace', 'Conversation', 'Message', 'Notification'],
  keepUnusedDataFor: 0,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
