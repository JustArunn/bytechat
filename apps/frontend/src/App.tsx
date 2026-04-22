import * as React from "react"
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/features/layout/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatInterface } from "@/features/chat/components/chat-interface"
import { Directory } from "@/features/chat/components/directory"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { SignupPage } from "@/features/auth/pages/SignupPage"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useGetWorkspaceConversationsQuery, useGetConversationQuery, conversationApi, useResetUnreadCountMutation } from "@/features/chat/api/conversationApi"
import { useGetMessagesQuery, useSendMessageMutation, useUpdateMessageMutation, useDeleteMessageMutation } from "@/features/chat/api/messageApi"
import { useGetWorkspacesQuery } from "@/features/workspace/api/workspaceApi"
import { Toaster, toast } from 'sonner'
import { Topbar } from "@/features/layout/components/topbar"
import { useLocation } from "react-router-dom"
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage"
import { LandingPage } from "@/features/landing/pages/LandingPage"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useWebSocket } from "@/features/chat/context/WebSocketContext"
import { useNotification } from "@/features/notifications/context/NotificationContext"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { messageApi } from "@/features/chat/api/messageApi"
import { useTheme } from "@/components/theme-provider"
import { NotificationProvider } from "@/features/notifications/context/NotificationContext"
import { WebSocketProvider } from "@/features/chat/context/WebSocketContext"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetMeQuery();
  if (isLoading) return <div className="h-screen w-full bg-background flex items-center justify-center text-foreground font-medium">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};


const AuthRedirect = () => {
  const { data: user, isLoading: isUserLoading } = useGetMeQuery();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useGetWorkspacesQuery(undefined, { skip: !user });
  const location = useLocation();

  const loading = isUserLoading || (user && isWorkspacesLoading);

  if (loading) {
    return <div className="h-screen w-full bg-background flex items-center justify-center text-foreground font-medium">Loading...</div>;
  }
  if (!user) return <Navigate to="/" />;
  if (workspaces && workspaces.length > 0) {
    const searchParams = new URLSearchParams(location.search);
    const invitedSlug = searchParams.get('workspace');

    // If invited to a specific workspace and already a member, go there directly
    if (invitedSlug) {
      const existingWorkspace = workspaces.find(w => w.slug === invitedSlug || w.id === invitedSlug);
      if (existingWorkspace) {
        return <Navigate to={`/${existingWorkspace.slug}`} />;
      }
      return <Navigate to={`/onboarding${location.search}`} />;
    }

    return <Navigate to={`/${workspaces[0].slug}`} />;
  }
  return <Navigate to={`/onboarding${location.search}`} />;
};



const AuthenticatedWrapper = ({ children }: { children: React.ReactNode }) => (
  <WebSocketProvider>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </WebSocketProvider>
);


const MainLayout = () => {
  const { workspaceId, conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const isDirectory = location.pathname.endsWith('/directory');

  const { data: workspaces } = useGetWorkspacesQuery();
  const { data: conversations = [] } = useGetWorkspaceConversationsQuery(workspaceId || '', { skip: !workspaceId });
  const { data: activeConversation } = useGetConversationQuery(conversationId || '', { skip: !conversationId || isDirectory });
  const { data: messages = [] } = useGetMessagesQuery({ conversationId: conversationId || '' }, { skip: !conversationId || isDirectory });
  const [sendMessage] = useSendMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [resetUnreadCount] = useResetUnreadCountMutation();

  const [isDeleteMessageConfirmOpen, setIsDeleteMessageConfirmOpen] = React.useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = React.useState<string | null>(null);

  // Redirect logic
  React.useEffect(() => {
    if (workspaces) {
      if (workspaces.length === 0 && location.pathname !== '/onboarding') {
        navigate('/onboarding');
      } else if (workspaces.length > 0 && !workspaceId) {
        navigate(`/${workspaces[0].slug}`);
      }
    }
  }, [workspaces, workspaceId, navigate, location.pathname]);

  // Redirect to first conversation if none selected in workspace (and not on directory)
  React.useEffect(() => {
    if (workspaceId && !conversationId && !isDirectory && conversations && conversations.length > 0) {
      navigate(`/${workspaceId}/${conversations[0].id}`);
    }
  }, [conversations, workspaceId, conversationId, isDirectory, navigate]);

  const { subscribe } = useWebSocket();
  const { addNotification, notifications, markAsRead, showBrowserNotification } = useNotification();
  const { data: currentUser } = useGetMeQuery();
  const conversationIdRef = React.useRef(conversationId);
  const workspaceIdRef = React.useRef(workspaceId);

  // Auto-mark notifications as read when entering a conversation
  React.useEffect(() => {
    if (conversationId && notifications.length > 0) {
      const relevantNotifications = notifications.filter(
        n => !n.isRead && n.link && (n.link.includes(`/${conversationId}`) || n.link.includes(`/${workspaceId}/${conversationId}`))
      );

      relevantNotifications.forEach(n => {
        markAsRead(n.id);
      });
    }

    if (conversationId && workspaceId) {
      resetUnreadCount({ conversationId, workspaceId });
    }

  }, [conversationId, workspaceId, notifications, markAsRead, resetUnreadCount]);

  React.useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  React.useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  React.useEffect(() => {
    // Wait until we have the user and their conversation list
    if (!currentUser || !conversations || conversations.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    // Subscribe to ALL conversations the user is a member of
    conversations.forEach((conv: any) => {
      const unsub = subscribe(`/topic/chat/${conv.id}`, (event: any) => {
        if (event.type === 'MESSAGE') {
          dispatch(
            messageApi.util.updateQueryData('getMessages', { conversationId: conv.id }, (draft) => {
              if (draft) {
                const exists = draft.some((m: any) => m.id === event.content.id);
                if (!exists) draft.push(event.content);
              }
            })
          );

          const isTabActive = document.visibilityState === 'visible' && document.hasFocus();
          const isSameChat = conv.id === conversationIdRef.current;

          if (isSameChat && isTabActive) {
            // Silent update - cache is already updated above
            return;
          }

          // Also invalidate tags if not same chat to refresh the sidebar previews
          if (!isSameChat) {
            dispatch(conversationApi.util.invalidateTags([{ type: 'Conversation', id: `LIST-${workspaceIdRef.current}` }]));
          }

        } else if (event.type === 'MESSAGE_UPDATE') {

          dispatch(
            messageApi.util.updateQueryData('getMessages', { conversationId: conv.id }, (draft) => {
              if (draft) {
                const index = draft.findIndex((m: any) => m.id === event.content.id);
                if (index !== -1) draft[index] = event.content;
              }
            })
          );
        } else if (event.type === 'MESSAGE_DELETE') {
          dispatch(
            messageApi.util.updateQueryData('getMessages', { conversationId: conv.id }, (draft) => {
              if (draft) {
                const index = draft.findIndex((m: any) => m.id === event.content);
                if (index !== -1) draft.splice(index, 1);
              }
            })
          );
        } else if (event.type === 'REACTION') {
          // Update just the reactions field of the affected message
          dispatch(
            messageApi.util.updateQueryData('getMessages', { conversationId: conv.id }, (draft) => {
              if (draft) {
                const index = draft.findIndex((m: any) => m.id === event.content.id);
                if (index !== -1) {
                  draft[index].reactions = event.content.reactions;
                }
              }
            })
          );

          const isTabActive = document.visibilityState === 'visible' && document.hasFocus();
          const isSameChat = conv.id === conversationIdRef.current;

          if (event.content.senderId === currentUser.id && event.senderId !== currentUser.id) {
            // If user is in the same chat and tab is active, we don't show toast/notification
            if (isSameChat && isTabActive) {
              return;
            }

            const reactorName = event.senderName || 'Someone';
            const textPreview = event.content.content.length > 30 ? event.content.content.substring(0, 30) + '...' : event.content.content;
            const link = `/${workspaceIdRef.current}/${conv.id}?messageId=${event.content.id}`;

            if (isTabActive) {
              let toastId: string | number;
              const description = (
                <>
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => {
                      if (toastId) toast.dismiss(toastId);
                      navigate(link);
                    }}
                  />
                  <div className="flex flex-col mt-0.5 relative z-0 pointer-events-none">
                    <span className="font-medium text-foreground text-[13px]">{reactorName}</span>
                    <span className="line-clamp-2 text-muted-foreground text-[13px] leading-snug truncate">Reacted to: "{textPreview}"</span>
                  </div>
                </>
              );
              toastId = toast("New Reaction", { description });
            } else {
              showBrowserNotification("New Reaction", `${reactorName} reacted to: "${textPreview}"`, link);
            }

            addNotification({
              type: 'REACTION',
              title: 'New Reaction',
              message: `${reactorName} reacted to: "${textPreview}"`,
              link,
              actorName: reactorName
            });
          }
        }
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(un => un());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, conversations?.length, subscribe]);

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!conversationId) return;
    try {
      await sendMessage({ content, channelId: conversationId, replyToId }).unwrap();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleUpdateMessage = async (id: string, content: string) => {
    if (!conversationId) return;
    try {
      await updateMessage({ id, content, channelId: conversationId }).unwrap();
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async () => {
    if (!conversationId || !messageToDeleteId) return;
    try {
      await deleteMessage({ id: messageToDeleteId, channelId: conversationId }).unwrap();
      toast.success('Message deleted');
      setIsDeleteMessageConfirmOpen(false);
      setMessageToDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleChannelSelect = (id: string) => {
    navigate(`/${workspaceId}/${id}`);
    if (workspaceId) {
      resetUnreadCount({ conversationId: id, workspaceId });
    }
  };


  const handleWorkspaceChange = (id: string) => {
    const ws = workspaces?.find(w => w.id === id);
    navigate(`/${ws?.slug || id}`);
  };

  const activeWorkspace = workspaces?.find(w => w.id === workspaceId || w.slug === workspaceId);

  return (
    <>
      <SidebarProvider className="h-screen w-full overflow-hidden">
        <div className="flex h-full w-full overflow-hidden bg-background font-sans antialiased text-foreground">
          <AppSidebar
            activeWorkspaceId={workspaceId}
            activeConversationId={isDirectory ? 'directory' : conversationId}
            onChannelSelect={handleChannelSelect}
            onWorkspaceChange={handleWorkspaceChange}
          />

          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-hidden">
              {isDirectory ? (
                <Directory workspaceId={workspaceId || ''} workspaceName={activeWorkspace?.name} />
              ) : activeConversation ? (
                <ChatInterface
                  conversationId={conversationId}
                  channelName={activeConversation.receiver ? activeConversation.receiver.fullName : activeConversation.name}
                  workspaceName={activeWorkspace?.name}
                  members={activeConversation.members || []}
                  messages={messages.map((m: any) => ({
                    id: m.id,
                    userId: m.senderId,
                    senderName: m.senderName,
                    senderImageUrl: m.senderImageUrl,
                    content: m.content,
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    reactions: m.reactions,
                    replyTo: m.replyTo
                  }))}
                  isDirect={activeConversation.type === 'DIRECT'}
                  type={activeConversation.type}
                  channelImageUrl={activeConversation.receiver?.imageUrl}
                  onSendMessage={handleSendMessage}
                  onUpdateMessage={handleUpdateMessage}
                  onDeleteMessage={(id) => {
                    setMessageToDeleteId(id);
                    setIsDeleteMessageConfirmOpen(true);
                  }}
                />

              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  {workspaceId ? "Select a channel or directory to begin" : "Select a workspace to begin"}
                </div>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <ConfirmDialog
        isOpen={isDeleteMessageConfirmOpen}
        onClose={() => {
          setIsDeleteMessageConfirmOpen(false);
          setMessageToDeleteId(null);
        }}
        onConfirm={handleDeleteMessage}
        title="Delete Message"
        description={
          <>
            Are you sure you want to delete <span className="font-bold text-white">this message</span>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete Message"
        variant="destructive"
      />
    </>
  );
};

export default function App() {
  const { data: user, isLoading } = useGetMeQuery();
  const { theme } = useTheme();

  if (isLoading) {
    return <div className="h-screen w-full bg-background flex items-center justify-center text-foreground font-medium">Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <AuthRedirect /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <OnboardingPage />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        } />
        <Route path="/:workspaceId/directory" element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <MainLayout />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        } />
        <Route path="/:workspaceId/:conversationId" element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <MainLayout />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        } />
        <Route path="/:workspaceId" element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <MainLayout />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster
        position="bottom-right"
        theme={theme as 'light' | 'dark' | 'system'}
        toastOptions={{
          classNames: {
            toast: 'group bg-[#1d1d1f]/80 backdrop-blur-[20px] saturate-[180%] border border-white/10 text-white shadow-[0_3px_20px_rgba(0,0,0,0.4)] rounded-xl py-3 px-4 min-h-0 flex items-start gap-3 transition-all font-sans',
            title: 'text-[14px] font-semibold text-white tracking-tight',
            description: 'text-[14px] text-white/60 leading-snug tracking-tight font-normal',
            error: 'border-red-500/50 bg-red-500/10 text-red-100',
            success: 'border-[#0071e3]/50 bg-[#0071e3]/10 text-[#0071e3]',
            actionButton: 'bg-[#0071e3] text-white font-medium rounded-full px-4 py-1 hover:opacity-90 transition-opacity',
            cancelButton: 'bg-white/10 text-white hover:bg-white/20 transition-colors rounded-full px-4 py-1',
          }
        }}
      />
    </>
  );
}
