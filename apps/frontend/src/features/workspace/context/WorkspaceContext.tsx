import React, { createContext, useContext, useState, useEffect } from 'react';
import { workspaceService } from '@/services/workspace.service';
import { conversationService } from '@/services/conversation.service';

interface WorkspaceContextType {
  workspaces: any[];
  activeWorkspace: any;
  conversations: any[];
  setActiveWorkspace: (workspace: any) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  const refreshWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspaceState(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces', error);
    }
  };

  const refreshConversations = async () => {
    if (activeWorkspace) {
      try {
        const data = await conversationService.getWorkspaceConversations(activeWorkspace.id);
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [activeWorkspace]);

  const setActiveWorkspace = (workspace: any) => {
    setActiveWorkspaceState(workspace);
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      activeWorkspace, 
      conversations, 
      setActiveWorkspace, 
      refreshWorkspaces,
      refreshConversations
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
