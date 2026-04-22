import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';


import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useClearAllMutation,
  notificationApi
} from '@/features/notifications/api/notificationApi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import { useWebSocket } from '@/features/chat/context/WebSocketContext';
import { workspaceApi } from '@/features/workspace/api/workspaceApi';
import { conversationApi } from '@/features/chat/api/conversationApi';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import { registerPushNotifications } from '../utils/NotificationManager';



export interface Notification {
  id: string;
  type: 'MESSAGE' | 'REACTION' | 'MENTION' | 'MEMBER';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
  link?: string;
  actorName?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  hasNewMembers: boolean;
  clearNewMembers: () => void;
  showBrowserNotification: (title: string, message: string, link?: string) => void;
}


const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { data: user } = useGetMeQuery();
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { 
    pollingInterval: 30000,
    skip: !user
  });
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [clearAllMutation] = useClearAllMutation();
  const [hasNewMembers, setHasNewMembers] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    // Optimistic UI update for instant feedback
    const newNotification: Notification = {
      ...notificationData,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: Date.now(),
    };

    dispatch(
      notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
        draft.unshift(newNotification);
      })
    );

    // Invalidate after a small delay so we fetch the real notification ID from the DB
    setTimeout(() => {
      dispatch(notificationApi.util.invalidateTags(['Notification']));
    }, 1500);
  }, [dispatch]);

   const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

 
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    
    if (user) {
      registerPushNotifications();
    }
  }, [user]);


  const showBrowserNotification = (title: string, message: string, link?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body: message,
        icon: '/logo.png',
        tag: link,
      });

      n.onclick = () => {
        window.focus();
        if (link) window.location.href = link;
      };
    }
  };

  useEffect(() => {
    if (!user || !subscribe) return;

    const unsubscribe = subscribe(`/user/queue/notifications`, (payload: any) => {
      // Ensure we have a parsed object
      let event = payload;
      if (typeof payload === 'string') {
        try {
          event = JSON.parse(payload);
        } catch (e) {
          console.error('[Notification] Failed to parse message body:', e);
          return;
        }
      }

      console.log('[NotificationContext] Received event:', event);

      if (!event || !event.type) {
        console.warn('[Notification] Received event with no type:', event);
        return;
      }

      const isTabActive = document.visibilityState === 'visible' && document.hasFocus();
      const isSameChat = event.conversationId && window.location.pathname.includes(event.conversationId);

      switch (event.type) {
        case 'MEMBER_JOINED':
          if (event.conversationId) {
            dispatch(workspaceApi.util.invalidateTags([{ type: 'Workspace', id: `MEMBERS-${event.conversationId}` }]));
          }
          if (event.workspaceSlug) {
            dispatch(workspaceApi.util.invalidateTags([{ type: 'Workspace', id: `MEMBERS-${event.workspaceSlug}` }]));
          }
          
          if (isTabActive) {
            toast.info(`${event.senderName || 'A new user'} joined the workspace`);
          } else {
            showBrowserNotification('New Member Joined', `${event.senderName || 'A new user'} has joined the workspace.`);
          }
          
          addNotification({
            type: 'MEMBER',
            title: 'New Member Joined',
            message: `${event.senderName || 'A new user'} has joined the workspace`,
            actorName: event.senderName,
            link: `/${event.workspaceSlug || ''}/directory`
          });
          
          setHasNewMembers(true);
          break;

        case 'CHANNEL_CREATED':
          if (event.content?.workspaceSlug) {
            dispatch(
              conversationApi.util.updateQueryData('getWorkspaceConversations', event.content.workspaceSlug, (draft) => {
                const exists = draft.find(c => c.id === event.conversationId);
                if (!exists) draft.unshift(event.content);
              })
            );
          }
          dispatch(conversationApi.util.invalidateTags(['Conversation']));
          
          if (isTabActive) {
            toast.success(`New channel created: ${event.content?.name || 'Untitled'}`);
          } else {
            showBrowserNotification('New Channel', `Channel #${event.content?.name || 'Untitled'} was created.`);
          }
          break;

        case 'CONVERSATION_CREATED':
          if (event.content?.workspaceSlug) {
            dispatch(
              conversationApi.util.updateQueryData('getWorkspaceConversations', event.content.workspaceSlug, (draft) => {
                const exists = draft.find(c => c.id === event.conversationId);
                if (!exists) draft.unshift(event.content);
              })
            );
          }
          dispatch(conversationApi.util.invalidateTags(['Conversation']));
          
          if (isTabActive) {
            toast.success(`New conversation started with ${event.senderName || 'someone'}`);
          } else {
            showBrowserNotification('New DM', `${event.senderName || 'Someone'} started a conversation with you.`);
          }
          break;

        case 'NEW_MESSAGE': {
          const { conversationId, senderName, content } = event;
          const messageContent = content?.message || 'Sent a message';
          const workspaceSlug = content?.workspaceSlug;

          if (workspaceSlug) {
            let found = false;
            dispatch(
              conversationApi.util.updateQueryData('getWorkspaceConversations', workspaceSlug, (draft) => {
                const index = draft.findIndex(c => c.id === conversationId);
                if (index !== -1) {
                  const [convo] = draft.splice(index, 1);
                  convo.lastMessage = messageContent;
                  if (!isSameChat) {
                    convo.unreadCount = (convo.unreadCount || 0) + 1;
                  }
                  draft.unshift(convo);
                  found = true;
                }


              })
            );

            if (!found) {
              dispatch(conversationApi.util.invalidateTags([{ type: 'Conversation', id: `LIST-${workspaceSlug}` }]));
            }
          }

          // If user is in the same chat and tab is active, we do nothing (silent update)
          if (isSameChat && isTabActive) {
            return;
          }

          if (isTabActive) {
            // Show toast for in-app
            const link = `/${workspaceSlug || ''}/${conversationId}`;
            toast.info(`New message from ${senderName || 'Someone'}`, {
              description: (
                <div 
                  className="cursor-pointer hover:underline" 
                  onClick={() => navigate(link)}
                >
                  {messageContent}
                </div>
              ),
            });
          } else {
            // Show browser notification for push
            showBrowserNotification(
              senderName || 'New Message',
              messageContent,
              `/${workspaceSlug || ''}/${conversationId}`
            );
          }


          // Always add to notification history if not same chat + active
          addNotification({
            type: 'MESSAGE',
            title: senderName || 'New Message',
            message: messageContent,
            actorName: senderName,
            link: `/${workspaceSlug || ''}/${conversationId}`
          });
          
          break;
        }

        case 'NOTIFICATION':
          dispatch(conversationApi.util.invalidateTags(['Conversation']));
          break;
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, subscribe, dispatch, addNotification]);


  const markAsRead = (id: string) => {

    markAsReadMutation(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation();
  };

  const clearAll = () => {
    clearAllMutation();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      hasNewMembers,
      clearNewMembers: () => setHasNewMembers(false),
      showBrowserNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );

};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
