"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RiSearchLine, RiUserAddLine } from "@remixicon/react"
import { useAddMemberToConversationMutation } from "@/features/chat/api/conversationApi"
import { toast } from "sonner"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface AddMemberDialogProps {
  conversationId: string
  isOpen: boolean
  onClose: () => void
  workspaceMembers: any[]
  currentMembers: any[]
}

export function AddMemberDialog({ 
  conversationId, 
  isOpen, 
  onClose, 
  workspaceMembers, 
  currentMembers 
}: AddMemberDialogProps) {
  const [search, setSearch] = React.useState("")
  const [addMember, { isLoading }] = useAddMemberToConversationMutation()

  const nonMembers = workspaceMembers.filter(wm =>
    !currentMembers.some((cm: any) => cm.id === wm.id)
  )

  const filtered = nonMembers.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (userId: string) => {
    try {
      await addMember({ conversationId, userId }).unwrap()
      toast.success("Member added to channel")
    } catch (error) {
      toast.error("Failed to add member")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-0 border border-border bg-background text-foreground gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
            <RiUserAddLine className="size-4" />
            Add Members
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select members from the workspace to add them to this conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="relative group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search people in workspace..."
              className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px] pr-1">
            <div className="space-y-1">
              {filtered.length > 0 ? (
                filtered.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-md">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="text-xs bg-muted">{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{member.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-[10px] font-bold bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all rounded-md"
                      onClick={() => handleAdd(member.id)}
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">No people found to add.</p>
                </div>
              )}
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
