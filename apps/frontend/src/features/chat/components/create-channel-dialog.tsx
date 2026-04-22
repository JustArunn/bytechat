import * as React from "react"
import { useCreateConversationMutation, useAddMemberToConversationMutation } from "@/features/chat/api/conversationApi"
import { useGetWorkspaceMembersQuery } from "@/features/workspace/api/workspaceApi"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiAddLine, RiCheckLine } from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  currentUserId?: string
}

export function CreateChannelDialog({ open, onOpenChange, workspaceId, currentUserId }: CreateChannelDialogProps) {
  const [name, setName] = React.useState("")


  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([])
  const [createChannel, { isLoading: isCreating }] = useCreateConversationMutation()
  const [addMember] = useAddMemberToConversationMutation()
  const { data: members = [] } = useGetWorkspaceMembersQuery(workspaceId, { skip: !workspaceId })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const channel = await createChannel({
        name: name.trim(),
        type: 'PRIVATE',
        workspaceId
      }).unwrap()


      // Add selected members
      for (const userId of selectedMembers) {
        await addMember({ conversationId: channel.id, userId }).unwrap()
      }

      toast.success(`Channel #${name} created!`)
      onOpenChange(false)
      setName("")
      setSelectedMembers([])

    } catch (err: any) {
      toast.error(err.data?.message || "Failed to create channel")
    }
  }


  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <RiAddLine className="size-5 text-primary" />
            Create a channel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Channels are where your team communicates. They are private and only visible to members you add.
          </DialogDescription>

        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel Name</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary font-bold">#</span>
              <Input
                placeholder="e.g. marketing"
                className="bg-muted/50 border-border pl-8 h-10 focus:ring-primary/50 focus:border-primary/50"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
              />
            </div>
          </div>




          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Members ({selectedMembers.length})</label>
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const others = members.filter((m: any) => m.id !== currentUserId)
                    if (selectedMembers.length === others.length) {
                      setSelectedMembers([])
                    } else {
                      setSelectedMembers(others.map((m: any) => m.id))
                    }
                  }}
                  className="text-[10px] text-primary hover:underline uppercase font-bold"
                >
                  {selectedMembers.length === members.filter((m: any) => m.id !== currentUserId).length ? "Unselect All" : "Select All"}
                </button>
              )}
            </div>
            <ScrollArea className="h-[200px] rounded-md border border-border bg-muted/30 p-2">
              <div className="space-y-1">
                {members.filter((m: any) => m.id !== currentUserId).map((member: any) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${selectedMembers.includes(member.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="bg-muted text-[10px]">
                          {member.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{member.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    {selectedMembers.includes(member.id) && (
                      <RiCheckLine className="size-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 rounded-md"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
