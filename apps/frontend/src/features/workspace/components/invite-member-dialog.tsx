import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useInviteMemberMutation } from "@/features/workspace/api/workspaceApi"

interface InviteMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
}

export function InviteMemberDialog({ isOpen, onClose, workspaceId }: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState("")
  const [inviteMember, { isLoading }] = useInviteMemberMutation()
  const [generatedLink, setGeneratedLink] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inviteMember({ workspaceId, email }).unwrap()
      const link = `${window.location.origin}/signup?workspace=${workspaceId}&email=${email.toLowerCase().trim()}`
      setGeneratedLink(link)
      toast.success("Invitation generated!")
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to generate invitation")
    }
  }

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleDone = () => {
    setGeneratedLink(null)
    setEmail("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden border-border bg-background text-foreground rounded-md">
        {!generatedLink ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle className="text-sm font-bold text-white">Invite to Workspace</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Invite a user by email. They will be required to use this email to join.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  className="bg-muted/50 border-border text-foreground h-8 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="h-8 text-[11px] font-bold hover:bg-muted hover:text-foreground rounded-md"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-8 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                >
                  {isLoading ? "Generating..." : "Generate Link"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="p-4 space-y-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-sm font-bold text-white">Share Invitation</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Send this link to <span className="text-white font-medium">{email}</span> to join the workspace.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-muted rounded-md border border-border break-all">
                <code className="text-[10px] text-muted-foreground select-all">{generatedLink}</code>
              </div>
              <Button 
                onClick={handleCopy}
                className="w-full h-8 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md gap-2"
              >
                Copy Invite Link
              </Button>
            </div>

            <Button 
              variant="ghost"
              onClick={handleDone}
              className="w-full h-8 text-[11px] font-bold hover:bg-muted hover:text-foreground rounded-md"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
