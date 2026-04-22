"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  RiMailLine,
  RiMessage3Line,
  RiShieldUserLine,
  RiPhoneLine,
  RiCalendarLine,
  RiEditLine,
  RiDeleteBinLine,
  RiStarFill,
  RiArrowDownSLine
} from "@remixicon/react"
import { useGetOrCreateDirectMutation } from "@/features/chat/api/conversationApi"
import { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } from "@/features/user/api/userApi"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useGetWorkspaceQuery, useAddCoAdminMutation, useRemoveCoAdminMutation } from "@/features/workspace/api/workspaceApi"
import { useNavigate, useParams } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import React from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"

interface UserProfileDialogProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export function UserProfileDialog({ user, isOpen, onClose }: UserProfileDialogProps) {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const { data: workspace } = useGetWorkspaceQuery(workspaceId!, { skip: !workspaceId })
  const { data: fullUser, isLoading } = useGetUserQuery(user?.id || '', { skip: !user?.id || !isOpen })

  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [addCoAdmin] = useAddCoAdminMutation()
  const [removeCoAdmin] = useRemoveCoAdminMutation()
  const [getOrCreateDirect] = useGetOrCreateDirectMutation()

  const [isEditing, setIsEditing] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    fullName: "",
    title: "",
    mobile: ""
  })

  React.useEffect(() => {
    if (fullUser) {
      setEditForm({
        fullName: fullUser.fullName || "",
        title: fullUser.title || "",
        mobile: fullUser.mobile || ""
      })
    }
  }, [fullUser])

  if (!user) return null

  const profile = fullUser || user
  const name = profile.fullName || profile.name || "Unknown User"
  const email = profile.email || "No email provided"
  const avatar = profile.imageUrl || profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`
  const title = profile.title || "Member"
  const mobile = profile.mobile || "Not set"
  const joinedDate = profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"

  const isWorkspaceAdmin = workspace?.adminId === me?.id || workspace?.coAdminIds?.includes(me?.id)
  const isTargetCoAdmin = workspace?.coAdminIds?.includes(profile.id)
  const isTargetAdmin = workspace?.adminId === profile.id

  const handleMessage = async () => {
    if (!workspaceId) return
    try {
      const conversation = await getOrCreateDirect({ workspaceId, userId: profile.id }).unwrap()
      navigate(`/${workspaceId}/${conversation.id}`)
      onClose()
    } catch (error) {
      console.error("Failed to start DM", error)
    }
  }

  const handleUpdate = async () => {
    try {
      await updateUser({ id: profile.id, ...editForm }).unwrap()
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(profile.id).unwrap()
      setIsDeleteConfirmOpen(false)
      onClose()
      toast.success("User deleted successfully")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const handleToggleCoAdmin = async () => {
    try {
      if (isTargetCoAdmin) {
        await removeCoAdmin({ workspaceId: workspaceId!, userId: profile.id }).unwrap()
        toast.success("Co-admin removed")
      } else {
        await addCoAdmin({ workspaceId: workspaceId!, userId: profile.id }).unwrap()
        toast.success("User promoted to Co-admin")
      }
    } catch (error) {
      toast.error("Failed to update admin permissions")
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[440px] p-0 border border-border bg-background text-foreground overflow-hidden rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">User Profile: {name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed profile and management options for {name}.
          </DialogDescription>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
              <div className="size-10 rounded-full border-2 border-border border-t-primary animate-spin" />
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Loading Profile...</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="h-24 bg-[#007a5a] relative">
                {isTargetAdmin && (
                  <div className="absolute top-4 left-6 flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
                    <RiStarFill className="size-3 text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Workspace Owner</span>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-3">
                  <Avatar className="size-32 rounded-[28px] border-[6px] border-[#0a0a0a] shadow-2xl">
                    <AvatarImage src={avatar} alt={name} className="object-cover" />
                    <AvatarFallback className="bg-muted text-4xl font-bold">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2.5 right-2.5 size-5 bg-[#2bac76] border-[3px] border-[#0a0a0a] rounded-full" />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3 mr-4">
                        <Input
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="h-9 bg-muted border-border font-bold text-foreground"
                          placeholder="Full Name"
                        />
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="h-9 bg-muted border-border text-xs text-foreground"
                          placeholder="Title"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[24px] font-black tracking-tight leading-tight truncate">{name}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <RiShieldUserLine className="size-3.5" />
                          <span className="text-xs font-medium">{title}</span>
                          {isTargetCoAdmin && !isTargetAdmin && (
                            <div className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-[4px] text-[8px] font-bold uppercase tracking-wider">Workspace Admin</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <Button
                      className="h-8 rounded-md font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                      onClick={handleMessage}
                    >
                      <RiMessage3Line className="size-3.5" />
                      <span className="text-[11px]">Message</span>
                    </Button>

                    {isWorkspaceAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            className="h-8 rounded-md font-bold bg-secondary text-secondary-foreground border-none transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                          >
                            <span className="text-[11px]">Actions</span>
                            <RiArrowDownSLine className="size-3.5 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width) bg-muted border-border text-foreground p-1 rounded-md shadow-2xl">
                          <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-1.5 rounded-md focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" onClick={() => setIsEditing(true)}>
                            <RiEditLine className="size-3.5" />
                            <span className="text-[11px] font-semibold">Edit Profile</span>
                          </DropdownMenuItem>
                          {!isTargetAdmin && (
                            <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-1.5 rounded-md focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" onClick={handleToggleCoAdmin}>
                              <RiStarFill className="size-3.5 text-yellow-500" />
                              <span className="text-[11px] font-semibold">{isTargetCoAdmin ? "Remove Co-admin" : "Make Co-admin"}</span>
                            </DropdownMenuItem>
                          )}
                          {!isTargetAdmin && (
                            <>
                              <DropdownMenuSeparator className="bg-border my-1" />
                              <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-1.5 rounded-md focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer transition-colors" onClick={() => setIsDeleteConfirmOpen(true)}>
                                <RiDeleteBinLine className="size-3.5" />
                                <span className="text-[11px] font-semibold">Delete User</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-8 rounded-lg font-bold bg-secondary text-secondary-foreground border-none transition-all active:scale-[0.98]"
                      >
                        <span className="text-[11px]">Actions</span>
                      </Button>
                    )}
                  </div>
                )}

                <Separator className="bg-border mb-5" />

                <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">About This User</h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 group">
                      <div className="size-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-all duration-300">
                        <RiMailLine className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-sm font-bold text-foreground truncate">{email}</p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-4 group">
                        <div className="size-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-all duration-300">
                          <RiPhoneLine className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Mobile</p>
                          <Input
                            value={editForm.mobile}
                            onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                            className="h-8 bg-muted border-border text-xs text-foreground"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 group">
                        <div className="size-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-all duration-300">
                          <RiPhoneLine className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Mobile</p>
                          <p className="text-sm font-bold text-foreground truncate">{mobile}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 group">
                      <div className="size-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-all duration-300">
                        <RiCalendarLine className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Joined</p>
                        <p className="text-sm font-bold text-foreground truncate">{joinedDate}</p>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      <Button
                        variant="secondary"
                        className="h-8 rounded-lg font-bold bg-secondary text-secondary-foreground border-none transition-all active:scale-[0.98]"
                        onClick={() => setIsEditing(false)}
                      >
                        <span className="text-[11px]">Cancel</span>
                      </Button>
                      <Button
                        className="h-8 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]"
                        onClick={handleUpdate}
                      >
                        <span className="text-[11px]">Save Changes</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete <span className="font-bold text-white">{name}</span>?
            This action will permanently remove their access and data. It cannot be undone.
          </>
        }
        confirmText="Delete User"
        variant="destructive"
      />
    </>
  )
}
