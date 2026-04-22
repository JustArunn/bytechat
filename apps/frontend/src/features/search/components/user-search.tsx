"use client"

import * as React from "react"
import { useGetWorkspaceMembersQuery } from "@/features/workspace/api/workspaceApi"
import { useGetOrCreateDirectMutation } from "@/features/chat/api/conversationApi"
import { useNavigate } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserSearchProps {
  workspaceId: string
}

export function UserSearch({ workspaceId }: UserSearchProps) {
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  const { data: members = [] } = useGetWorkspaceMembersQuery(workspaceId, { skip: !workspaceId })
  const [getOrCreateDirect] = useGetOrCreateDirectMutation()

  const filteredMembers = members.filter((member: any) =>
    member.fullName.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5)

  const handleSelectUser = async (userId: string) => {
    try {
      const conversation = await getOrCreateDirect({ workspaceId, userId }).unwrap()
      navigate(`/${workspaceId}/${conversation.id}`)
      setSearch("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to start DM", error)
    }
  }

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent className="relative">
        <DropdownMenu open={open && search.length > 0} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarInput
              placeholder="Search users..."
              className="bg-transparent border-border focus:bg-muted/50 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value.length > 0) setOpen(true)
              }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) bg-muted border-border p-1"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member: any) => (
                <DropdownMenuItem
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer rounded-md"
                  onClick={() => handleSelectUser(member.id)}
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="bg-muted text-xs text-foreground">
                      {member.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{member.fullName}</span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
