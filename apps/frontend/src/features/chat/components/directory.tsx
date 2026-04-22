"use client"

import * as React from "react"
import { useGetWorkspaceMembersQuery } from "@/features/workspace/api/workspaceApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiMailLine, RiMessage3Line, RiSearchLine, RiCalendarLine, RiUserAddLine } from "@remixicon/react"
import { Input } from "@/components/ui/input"
import { useGetOrCreateDirectMutation } from "@/features/chat/api/conversationApi"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useGetWorkspaceQuery } from "@/features/workspace/api/workspaceApi"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { UserProfileDialog } from "@/features/user/components/user-profile-dialog"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { InviteMemberDialog } from "@/features/workspace/components/invite-member-dialog"

interface DirectoryProps {
  workspaceId: string
  workspaceName?: string
}

export function Directory({ workspaceId, workspaceName }: DirectoryProps) {
  const [search, setSearch] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = React.useState(false)
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const { data: workspace } = useGetWorkspaceQuery(workspaceId, { skip: !workspaceId })
  const { data: membersData = [], isLoading, isError } = useGetWorkspaceMembersQuery(workspaceId, { skip: !workspaceId })
  const [getOrCreateDirect] = useGetOrCreateDirectMutation()

  const isMeAdmin = workspace?.adminId === me?.id || workspace?.coAdminIds?.includes(me?.id)

  // Ensure we handle both flat arrays and nested object responses
  const members = React.useMemo(() => {
    if (Array.isArray(membersData)) return membersData;
    if (membersData && typeof membersData === 'object' && 'members' in membersData && Array.isArray((membersData as any).members)) {
      return (membersData as any).members;
    }
    return [];
  }, [membersData]);

  const filteredMembers = members.filter((member: any) => {
    const name = member.fullName || member.name || "Unknown User";
    const email = member.email || "";
    return name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
  })

  const handleStartDM = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening profile when clicking message button
    try {
      const conversation = await getOrCreateDirect({ workspaceId, userId }).unwrap()
      navigate(`/${workspaceId}/${conversation.id}`)
    } catch (error) {
      console.error("Failed to start DM", error)
    }
  }

  const handleOpenProfile = (user: any) => {
    setSelectedUser(user)
    setIsProfileOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background/50 backdrop-blur-sm space-y-4 animate-in fade-in duration-500">
        <div className="size-12 rounded-full border-4 border-border border-t-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground tracking-wide">Loading workspace members...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <RiMailLine className="size-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Failed to load directory</h2>
        <p className="text-muted-foreground mt-2 max-w-xs">
          There was an error fetching the member list. Please check your connection and try again.
        </p>
        <Button
          className="mt-6 border-border hover:bg-muted"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-300">
      <header className="px-8 py-6 border-b shrink-0 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">People</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and connect with everyone in <span className="font-semibold text-foreground">{workspaceName}</span>
              </p>
            </div>
            {isMeAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[11px] font-bold border-border hover:bg-muted rounded-md gap-1.5"
                  onClick={() => setIsInviteOpen(true)}
                >
                  <RiMailLine className="size-3.5 text-muted-foreground" />
                  Invite
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md gap-1.5 shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => setIsCreateUserOpen(true)}
                >
                  <RiUserAddLine className="size-3.5" />
                  Add Member
                </Button>
              </div>
            )}
          </div>

          <div className="relative max-w-md group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 h-10 bg-muted/30 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member: any) => {
            const name = member.fullName || member.name || "Unknown User";
            // const email = member.email || "No email provided";
            const avatar = member.imageUrl || member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`;

            return (
              <Card
                key={member.id}
                className="group bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 hover:bg-muted/10 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleOpenProfile(member)}
              >
                <CardHeader className="pb-0 pt-8 px-6 flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="size-24 rounded-2xl shadow-2xl ring-4 ring-background transition-transform group-hover:scale-105 duration-500">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="bg-muted text-2xl font-bold">
                        {name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 size-5 bg-primary border-4 border-background rounded-full shadow-lg" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-bold text-base text-foreground truncate tracking-tight">{name}</h3>
                      {(workspace?.coAdminIds?.includes(member.id) || workspace?.adminId === member.id) && (
                        <div className="px-1 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[8px] font-bold uppercase">Admin</div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{member.title || "Member"}</p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                      <RiCalendarLine className="size-3" />
                      <span>Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-lg border-border bg-muted/50 hover:bg-muted text-xs font-semibold tracking-wide"
                      onClick={(e) => handleStartDM(member.id, e)}
                    >
                      <RiMessage3Line className="size-3.5 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground/40 animate-in fade-in slide-in-from-bottom-4">
            <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <RiSearchLine className="size-10" />
            </div>
            <p className="text-lg font-medium">No members match your search</p>
            <p className="text-sm">Try searching for a different name or email address.</p>
          </div>
        )}
      </div>

      <UserProfileDialog
        user={selectedUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <CreateUserDialog
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        workspaceId={workspaceId}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  )
}
