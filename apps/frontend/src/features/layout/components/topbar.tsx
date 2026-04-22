"use client"

import { RiSearchLine, RiTimeLine, RiQuestionLine, RiFileCopyLine, RiUserAddLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { ThemeToggle } from "@/components/theme-toggle"
import { useParams } from "react-router-dom"
import { useGetWorkspacesQuery } from "@/features/workspace/api/workspaceApi"
import { toast } from "sonner"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GlobalSearch } from "@/features/search/components/global-search"
import { NotificationBell } from "@/features/notifications/components/notification-bell"
import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { RiCloseCircleFill } from "@remixicon/react"

export function Topbar() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchQuery("")

    // Clear messageId from URL if it exists
    if (searchParams.has('messageId')) {
      const newPath = window.location.pathname
      navigate(newPath)
    }
  }

  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-50 sticky top-0 border-border">
      <div className="flex-1 flex items-center gap-3">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors rounded-full" />
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full">
          <RiTimeLine className="size-5" />
        </Button>
      </div>

      <div
        className="w-full max-w-[540px] relative group cursor-pointer"
        onClick={() => setIsSearchOpen(true)}
      >
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        <div className="h-9 w-full bg-secondary/30 border border-transparent rounded-full pl-10 pr-3 flex items-center text-[13px] text-muted-foreground transition-all group-hover:bg-secondary/50 group-hover:border-primary/20">
          <span className="font-medium tracking-tight">
            {searchQuery || "Search workspace, messages, or files..."}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <RiCloseCircleFill className="size-4" />
              </button>
            )}
            <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1.5 rounded-full border border-border bg-background px-2 font-mono text-[9px] font-medium text-muted-foreground shadow-xs">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        <InviteButton />
        <ThemeToggle />
        <NotificationBell />
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full">
          <RiQuestionLine className="size-5" />
        </Button>
      </div>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        query={searchQuery}
        onQueryChange={(val) => {
          setSearchQuery(val)
          if (!val && searchParams.has('messageId')) {
            const newPath = window.location.pathname
            navigate(newPath)
          }
        }}
      />
    </header>
  )
}

function InviteButton() {
  const { workspaceId } = useParams()
  const { data: workspaces } = useGetWorkspacesQuery()
  const workspace = workspaces?.find(w => w.id === workspaceId)

  if (!workspace) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 px-4">
          <RiUserAddLine className="size-3.5" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border text-foreground sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">Invite people to {workspace.name}</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
            Share this join code with your team members to bring them into the workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-3 mt-4">
          <div className="grid flex-1 gap-2">
            <div className="h-12 flex items-center justify-center bg-secondary/30 border border-transparent rounded-xl text-2xl font-mono tracking-[0.5em] font-bold text-primary">
              {workspace.joinCode}
            </div>
          </div>
          <Button
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
            onClick={() => {
              navigator.clipboard.writeText(workspace.joinCode);
              toast.success("Code copied to clipboard!");
            }}
          >
            <RiFileCopyLine className="size-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
