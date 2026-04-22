import api from '@/lib/api';

export const workspaceService = {
  getWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },
  getWorkspace: async (id: string) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },
  createWorkspace: async (data: { name: string }) => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },
  joinWorkspace: async (joinCode: string) => {
    const response = await api.post(`/workspaces/join/${joinCode}`);
    return response.data;
  },
  getMembers: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  }
};
