"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiUserAddLine, RiMailLine, RiLockLine, RiUserLine, RiShieldUserLine } from "@remixicon/react"
import { useCreateUserMutation } from "@/features/user/api/userApi"
import { toast } from "sonner"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
}

export function CreateUserDialog({ isOpen, onClose, workspaceId }: CreateUserDialogProps) {
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
    title: "",
  })
  const [createUser, { isLoading }] = useCreateUserMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser({ ...formData, workspaceId }).unwrap()
      toast.success("User created successfully")
      setFormData({ email: "", password: "", fullName: "", title: "" })
      onClose()
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to create user")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] border-zinc-800 bg-zinc-950 text-white p-0 overflow-hidden shadow-2xl rounded-md">
        <DialogHeader className="p-6 pb-4 bg-zinc-900/20 border-b border-zinc-900">
          <DialogTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <RiUserAddLine className="size-3.5 text-primary" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 mt-1">
            Directly add a new member to the workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <RiUserLine className="size-3" />
                Full Name
              </label>
              <Input
                placeholder="e.g. John Doe"
                className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <RiShieldUserLine className="size-3" />
                Job Title
              </label>
              <Input
                placeholder="e.g. Software Engineer"
                className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <RiMailLine className="size-3" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <RiLockLine className="size-3" />
                Temporary Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-zinc-900">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-8 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-all"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-8 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-all shadow-lg active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
