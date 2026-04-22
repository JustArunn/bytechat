import * as React from "react"
import { useState } from "react"
import { useCreateWorkspaceMutation, useJoinWorkspaceMutation, useCheckSlugAvailabilityQuery, useGetInvitesQuery, useAcceptInviteMutation, useAcceptInviteBySlugMutation } from "@/features/workspace/api/workspaceApi"

import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { RiArrowLeftLine, RiCheckLine, RiErrorWarningLine, RiLoader4Line, RiBuilding4Line, RiMailSendLine, RiCheckDoubleLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebounce } from "@/hooks/use-debounce"
import { MessageSquare } from "lucide-react"

export function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState("")
  const [slug, setSlug] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [searchParams] = useSearchParams()
  const invitedWorkspaceSlug = searchParams.get("workspace")
  const [isAutoJoining, setIsAutoJoining] = useState(!!invitedWorkspaceSlug)
  
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation()
  const [joinWorkspace, { isLoading: isJoining }] = useJoinWorkspaceMutation()
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation()
  const [acceptInviteBySlug] = useAcceptInviteBySlugMutation()
  const { data: invites = [], isLoading: isInvitesLoading } = useGetInvitesQuery()
  
  const navigate = useNavigate()

  React.useEffect(() => {
    const autoJoin = async () => {
      if (invitedWorkspaceSlug) {
        try {
          const workspace = await acceptInviteBySlug(invitedWorkspaceSlug).unwrap()
          toast.success(`Joined ${workspace.name}!`)
          navigate(`/${workspace.slug}`)
        } catch (err: any) {
          console.error("Auto-join failed", err)
          setIsAutoJoining(false)
        }
      }
    }
    autoJoin()
  }, [invitedWorkspaceSlug, acceptInviteBySlug, navigate])

  const debouncedSlug = useDebounce(slug, 500)
  const { data: isAvailable, isLoading: isChecking } = useCheckSlugAvailabilityQuery(debouncedSlug, {
    skip: debouncedSlug.length < 3
  })

  const matchingInvite = invites.find(i => 
    i.workspaceSlug === invitedWorkspaceSlug || i.workspaceId === invitedWorkspaceSlug
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAvailable) {
      toast.error("This slug is already taken")
      return
    }
    try {
      const workspace = await createWorkspace({ name: workspaceName, slug }).unwrap()
      toast.success("Workspace created!")
      navigate(`/${workspace.slug}`)
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to create workspace")
    }
  }

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const workspace = await joinWorkspace(joinCode).unwrap()
      toast.success("Joined workspace!")
      navigate(`/${workspace.slug}`)
    } catch (err: any) {
      toast.error(err.data?.message || "Invalid invite code")
    }
  }

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const workspace = await acceptInvite(inviteId).unwrap()
      toast.success("Joined workspace!")
      navigate(`/${workspace.slug}`)
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to join workspace")
    }
  }

  if (isAutoJoining) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/30">
        <div className="w-full max-w-[420px] space-y-6 flex flex-col items-center text-center">
          <div className="size-12 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <MessageSquare className="size-6 text-primary-foreground" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">Joining Workspace...</h1>
            <p className="text-sm text-zinc-400">Please wait while we set things up for you.</p>
            <div className="flex justify-center pt-4">
              <RiLoader4Line className="size-8 text-primary animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/20">
      <div className="w-full max-w-[420px] space-y-6 relative">
        {/* Back Button */}
        {!matchingInvite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="absolute -top-10 -left-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-2 transition-all px-3 rounded-md"
          >
            <RiArrowLeftLine className="size-4" />
            <span className="text-[12px] font-medium">Go Back</span>
          </Button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="size-10 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
            <MessageSquare className="size-5 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-[24px] font-semibold tracking-tight">
              {matchingInvite ? "Join your workspace" : "Setup your workspace"}
            </h1>
            <p className="text-[14px] text-muted-foreground">
              {matchingInvite 
                ? "You've been invited to start collaborating" 
                : "Choose how you want to start collaborating"}
            </p>
          </div>
        </div>

        {isInvitesLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RiLoader4Line className="size-8 text-primary animate-spin" />
            <p className="text-[12px] text-muted-foreground">Preparing your experience...</p>
          </div>
        ) : matchingInvite ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-secondary/20 border border-primary/10 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <RiBuilding4Line className="size-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[18px] font-semibold">{matchingInvite.workspaceName}</h3>
                <p className="text-[13px] text-muted-foreground">bytechat.com/{matchingInvite.workspaceSlug}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-md border border-primary/10">
                <RiCheckDoubleLine className="size-3 text-primary" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-primary">Verified Invitation</span>
              </div>
            </div>

            <Button
              onClick={() => handleAcceptInvite(matchingInvite.inviteId)}
              disabled={isAccepting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-md font-medium text-base transition-all active:scale-[0.98] shadow-sm"
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <RiLoader4Line className="size-4 animate-spin" />
                  Joining...
                </span>
              ) : (
                "Continue to Workspace"
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
              Clicking continue will add you to this workspace
            </p>
          </div>
        ) : (
          <Tabs defaultValue={invites.length > 0 ? "join" : "create"} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/30 border border-border/50 p-1 h-10 rounded-md">
              <TabsTrigger 
                value="create" 
                className="rounded-sm text-[11px] uppercase font-semibold tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                Create New
              </TabsTrigger>
              <TabsTrigger 
                value="join" 
                className="rounded-sm text-[11px] uppercase font-semibold tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 relative"
              >
                Join Existing
                {invites.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] items-center justify-center font-bold text-primary-foreground">
                      {invites.length}
                    </span>
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-muted-foreground ml-1">Workspace Name</label>
                  <Input
                    placeholder="Acme Corp"
                    className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-11 rounded-md text-[14px]"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground ml-1 italic">Name your workspace. You can invite your team later.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-muted-foreground ml-1">Workspace URL (Slug)</label>
                  <div className="relative">
                    <Input
                      placeholder="acme-corp"
                      className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-11 rounded-md text-[14px] pr-12 font-mono"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {isChecking && <RiLoader4Line className="size-4 text-primary animate-spin" />}
                      {!isChecking && debouncedSlug.length >= 3 && (
                        isAvailable === true ? (
                          <RiCheckLine className="size-4 text-primary" />
                        ) : isAvailable === false ? (
                          <RiErrorWarningLine className="size-4 text-destructive" />
                        ) : (
                          <RiErrorWarningLine className="size-4 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground ml-1">
                    Your workspace will be available at: <span className="text-primary font-medium">bytechat.com/{slug || "slug"}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-md font-medium transition-all active:scale-[0.98] mt-2 shadow-sm"
                  disabled={isCreating || !workspaceName.trim() || !slug.trim() || !isAvailable || isChecking}
                >
                  {isCreating ? "Creating..." : "Create Workspace"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                {invites.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[12px] font-medium text-muted-foreground ml-1 flex items-center gap-2">
                        <RiMailSendLine className="size-3.5" />
                        Pending Invitations
                      </label>
                      <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                        {invites.map((invite) => (
                          <div 
                            key={invite.inviteId}
                            className="flex items-center justify-between p-3.5 bg-secondary/20 border border-border/50 rounded-2xl group hover:border-primary/20 transition-all"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="size-9 rounded-md bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <RiBuilding4Line className="size-4.5 text-muted-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-semibold">{invite.workspaceName}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">bytechat.com/{invite.workspaceSlug}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAcceptInvite(invite.inviteId)}
                              disabled={isAccepting}
                              className="h-8 rounded-md text-[12px] font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              Join
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-medium tracking-[0.2em] text-muted-foreground">
                        <span className="bg-background px-3">Or use a code</span>
                      </div>
                    </div>
                  </>
                )}

                <form onSubmit={handleJoinByCode} className="space-y-4">
                  <Input
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-11 rounded-md text-[16px] font-mono tracking-[0.5em] text-center"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full border-border hover:bg-secondary/50 h-11 rounded-md font-medium transition-all active:scale-[0.98]"
                    disabled={isJoining || joinCode.length !== 6}
                  >
                    {isJoining ? "Joining..." : "Join with Code"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-border/50 text-center">
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            {matchingInvite ? "Invitation Finalization" : "Workspace Configuration"}
          </p>
        </div>
      </div>
    </div>
  )
}
