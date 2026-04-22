"use client"

import * as React from "react"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useGetWorkspacesQuery } from "@/features/workspace/api/workspaceApi"
import { useGetWorkspaceConversationsQuery } from "@/features/chat/api/conversationApi"
import { useNotification } from "@/features/notifications/context/NotificationContext"


import { NavMain } from "@/features/chat/components/nav-main"
import { NavUser } from "@/features/user/components/nav-user"
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { RiContactsBook2Line, RiGalleryLine, RiHashtag, RiMessage3Line, RiAddLine } from "@remixicon/react"


import { useNavigate } from "react-router-dom"
import { CreateChannelDialog } from "@/features/chat/components/create-channel-dialog"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeWorkspaceId?: string
  activeConversationId?: string
  onChannelSelect?: (id: string) => void
  onWorkspaceChange?: (id: string) => void
  unreadCounts?: Map<string, number>
}

export function AppSidebar({
  activeWorkspaceId,
  activeConversationId,
  onChannelSelect,
  onWorkspaceChange,
  unreadCounts = new Map(),
  ...props
}: AppSidebarProps) {
  const { data: user } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: conversations = [] } = useGetWorkspaceConversationsQuery(activeWorkspaceId || '', {
    skip: !activeWorkspaceId,
    refetchOnMountOrArgChange: true
  });


  const navigate = useNavigate();
  const [isCreateChannelOpen, setIsCreateChannelOpen] = React.useState(false);

  const { clearNewMembers } = useNotification();

  const activeWorkspace = workspaces.find((w: any) => w.id === activeWorkspaceId || w.slug === activeWorkspaceId);
  const isWorkspaceAdmin = activeWorkspace?.adminId === user?.id || activeWorkspace?.coAdminIds?.includes(user?.id);



  const sidebarData = {
    user: {
      name: user?.fullName || "Guest",
      email: user?.email || "",
      avatar: user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
    },
    teams: workspaces.map((w: any) => ({
      id: w.id,
      name: w.name,
      logo: <RiGalleryLine />,
      plan: "Pro",
    })),
    navMain: [
      {
        title: "People",
        url: "#",
        icon: <RiContactsBook2Line />,
        items: [
          {
            id: 'directory',
            title: "People Directory",
            url: `/${activeWorkspaceId}/directory`,
            isActive: activeConversationId === 'directory',
          }
        ]
      },
      {
        title: "Channels",
        url: "#",
        icon: <RiHashtag />,
        isActive: true,
        action: isWorkspaceAdmin ? {
          icon: <RiAddLine className="size-4" />,
          onClick: () => setIsCreateChannelOpen(true)
        } : undefined,
        items: conversations
          .filter((c: any) => c.type !== 'DIRECT')
          .map((c: any) => ({
            id: c.id,
            title: c.name,
            url: "#",
            isActive: c.id === activeConversationId,
            badge: c.unreadCount || unreadCounts.get(c.id) || undefined,
            type: c.type
          })),

      },
      {
        title: "Direct Messages",
        url: "#",
        icon: <RiMessage3Line />,
        items: conversations
          .filter((c: any) => c.type === 'DIRECT')
          .map((c: any) => ({
            id: c.id,
            title: c.receiver?.fullName || "Unknown",
            url: "#",
            isActive: c.id === activeConversationId,
            badge: c.unreadCount || unreadCounts.get(c.id) || undefined
          })),
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-2">
        <WorkspaceSwitcher
          teams={sidebarData.teams}
          activeId={activeWorkspace?.id || activeWorkspaceId}
          onTeamChange={onWorkspaceChange}
          onAddWorkspace={() => navigate('/onboarding')}
        />
      </SidebarHeader>


      <SidebarContent>
        <NavMain
          items={sidebarData.navMain}
          onSelect={(id) => {
            if (id === 'directory') {
              clearNewMembers()
              navigate(`/${activeWorkspaceId}/directory`)
            } else {

              onChannelSelect?.(id)
            }
          }}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />

      <CreateChannelDialog
        open={isCreateChannelOpen}
        onOpenChange={setIsCreateChannelOpen}
        workspaceId={activeWorkspaceId || ''}
        currentUserId={user?.id}
      />
    </Sidebar>
  )
}
