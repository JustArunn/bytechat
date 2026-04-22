"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  RiInformationLine,
  RiUserAddLine,
  RiHashtag,
  RiDeleteBinLine,
  RiSearchLine,
  RiEditLine,
  RiCheckLine,
  RiUserUnfollowLine,
} from "@remixicon/react"
import { 
  useGetConversationQuery, 
  useDeleteConversationMutation, 
  useUpdateConversationMutation,
  useRemoveMemberFromConversationMutation 
} from "@/features/chat/api/conversationApi"
import { useGetWorkspaceMembersQuery, useGetWorkspaceQuery } from "@/features/workspace/api/workspaceApi"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import React from "react"

import { AddMemberDialog } from "@/features/workspace/components/add-member-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { ConfirmDialog } from "@/components/confirm-dialog"

interface ChannelDetailsDialogProps {
  conversationId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ChannelDetailsDialog({ conversationId, isOpen, onClose }: ChannelDetailsDialogProps) {
  const { data: conversation, isLoading } = useGetConversationQuery(conversationId || '', { skip: !conversationId || !isOpen })
  const { data: workspaceMembers = [] } = useGetWorkspaceMembersQuery(conversation?.workspaceId || '', { skip: !conversation?.workspaceId })
  const { data: workspace } = useGetWorkspaceQuery(conversation?.workspaceId || '', { skip: !conversation?.workspaceId })
  const { data: currentUser } = useGetMeQuery()
  const [deleteConversation] = useDeleteConversationMutation()
  const [updateConversation] = useUpdateConversationMutation()
  const [removeMember] = useRemoveMemberFromConversationMutation()
  const navigate = useNavigate()

  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false)
  const [memberSearch, setMemberSearch] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [editName, setEditName] = React.useState("")
  const [editType, setEditType] = React.useState("PUBLIC")

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = React.useState(false)
  const [memberToRemove, setMemberToRemove] = React.useState<any>(null)

  React.useEffect(() => {
    if (conversation) {
      setEditName(conversation.name)
      setEditType(conversation.type)
    }
  }, [conversation])

  if (!conversationId) return null

  const isWorkspaceAdmin = workspace?.adminId === currentUser?.id || workspace?.coAdminIds?.includes(currentUser?.id)
  const isChannelMember = conversation?.members?.some((m: any) => m.id === currentUser?.id)
  const isCreator = conversation?.creatorId === currentUser?.id
  const canAddMembers = isWorkspaceAdmin || isChannelMember
  const canManageChannel = isWorkspaceAdmin || isCreator

  const handleDeleteChannel = async () => {
    try {
      await deleteConversation(conversationId).unwrap()
      toast.success("Channel deleted")
      navigate(`/${conversation?.workspaceId}`)
      onClose()
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      toast.error("Failed to delete channel")
    }
  }

  const handleUpdateChannel = async () => {
    if (!editName.trim()) return
    try {
      await updateConversation({ 
        id: conversationId, 
        name: editName, 
        type: editType 
      }).unwrap()
      toast.success("Channel updated")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update channel")
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return
    try {
      await removeMember({ conversationId, userId: memberToRemove.id }).unwrap()
      toast.success("Member removed")
      setIsRemoveConfirmOpen(false)
      setMemberToRemove(null)
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  const filteredMembers = conversation?.members?.filter((m: any) =>
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  ) || []

  // Show only first 5 members
  const displayedMembers = filteredMembers.slice(0, 5)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[480px] w-full h-[580px] p-0 border border-zinc-800 bg-zinc-950 text-white gap-0 overflow-hidden shadow-2xl flex flex-col">
          <DialogHeader className="p-4 border-b border-zinc-900 bg-zinc-900/20 shrink-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-zinc-400 uppercase tracking-widest">
              <RiInformationLine className="size-4" />
              Channel Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed information and settings for the current channel.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1">
                <div className="p-5 space-y-6">
                  {/* Condensed Channel Header */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                          <RiHashtag className="size-7 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          {isEditing ? (
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xl font-bold w-full focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                              autoFocus
                            />
                          ) : (
                            <h2 className="text-xl font-bold truncate">#{conversation?.name}</h2>
                          )}
                          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-60 flex items-center gap-2">
                            {conversation?.type} Channel
                            <span className="size-1 rounded-full bg-zinc-700" />
                            Created {conversation?.createdAt ? new Date(conversation.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "N/A"}
                          </p>
                        </div>
                      </div>
                      {canManageChannel && !isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          onClick={() => setIsEditing(true)}
                        >
                          <RiEditLine className="size-4" />
                        </Button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visibility</label>
                          <div className="flex gap-2">
                            <Button
                              variant={editType === "PUBLIC" ? "default" : "outline"}
                              size="sm"
                              className={`flex-1 h-8 text-[11px] font-bold ${editType === "PUBLIC" ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'border-zinc-800'}`}
                              onClick={() => setEditType("PUBLIC")}
                            >
                              Public
                            </Button>
                            <Button
                              variant={editType === "PRIVATE" ? "default" : "outline"}
                              size="sm"
                              className={`flex-1 h-8 text-[11px] font-bold ${editType === "PRIVATE" ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'border-zinc-800'}`}
                              onClick={() => setEditType("PRIVATE")}
                            >
                              Private
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="h-8 flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            onClick={handleUpdateChannel}
                          >
                            <RiCheckLine className="size-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-4 text-zinc-400 hover:text-white font-bold text-xs"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Members Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Members ({conversation?.members?.length || 0})
                      </h3>
                      {canAddMembers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-emerald-600/10 hover:text-emerald-500"
                          onClick={() => setIsAddMemberOpen(true)}
                        >
                          <RiUserAddLine className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Member Search */}
                    <div className="relative group">
                      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {displayedMembers.length > 0 ? (
                        displayedMembers.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-default group">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-7 rounded-md">
                                <AvatarImage src={member.imageUrl} />
                                <AvatarFallback className="text-[10px] bg-zinc-800">{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{member.fullName}</span>
                                <span className="text-[9px] text-zinc-500">{member.email}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {member.id === conversation?.creatorId && (
                                <span className="text-[7px] font-black bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                                  Channel Manager
                                </span>
                              )}
                              {canManageChannel && member.id !== conversation?.creatorId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  onClick={() => {
                                    setMemberToRemove(member)
                                    setIsRemoveConfirmOpen(true)
                                  }}
                                >
                                  <RiUserUnfollowLine className="size-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs text-zinc-600">No members found matching "{memberSearch}"</p>
                        </div>
                      )}
                      {filteredMembers.length > 5 && (
                        <p className="text-[10px] text-zinc-600 text-center pt-2 italic">
                          Showing top 5 results. Refine search to find more.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <ScrollBar />
              </ScrollArea>

              {canManageChannel && (
                <div className="p-5 border-t border-zinc-900 bg-zinc-900/10 shrink-0">
                  <div className="p-3 rounded-xl bg-red-950/5 border border-red-900/10 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Danger Zone</h3>
                      <p className="text-[10px] text-zinc-600 truncate">Delete this channel and its history</p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-red-600/10 text-red-500 border border-red-900/20 hover:bg-red-600 hover:text-white transition-all h-8 px-3 text-[10px] font-bold shrink-0"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                      <RiDeleteBinLine className="size-3 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddMemberDialog
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        conversationId={conversationId}
        workspaceMembers={workspaceMembers}
        currentMembers={conversation?.members || []}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteChannel}
        title="Delete Channel"
        description={
          <>
            Are you sure you want to delete <span className="font-bold text-white">#{conversation?.name}</span>? 
            All messages and history will be permanently removed. This action cannot be undone.
          </>
        }
        confirmText="Delete Channel"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={isRemoveConfirmOpen}
        onClose={() => {
          setIsRemoveConfirmOpen(false)
          setMemberToRemove(null)
        }}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        description={
          <>
            Are you sure you want to remove <span className="font-bold text-white">{memberToRemove?.fullName}</span> from 
            <span className="font-bold text-emerald-500 ml-1">#{conversation?.name}</span>? 
            They will no longer have access to this channel's history.
          </>
        }
        confirmText="Remove Member"
        variant="destructive"
      />
    </>
  )
}
