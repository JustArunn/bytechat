"use client"

import * as React from "react"
import { RiSearchLine, RiHashtag, RiMessage2Line, RiArrowRightUpLine, RiLoader4Line } from "@remixicon/react"
import { useNavigate, useParams } from "react-router-dom"
import { useSearchQuery } from "@/features/search/api/searchApi"
import { useGetOrCreateDirectMutation } from "@/features/chat/api/conversationApi"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  query: string
  onQueryChange: (query: string) => void
}

export function GlobalSearch({ isOpen, onClose, query, onQueryChange }: GlobalSearchProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [getOrCreateDirect] = useGetOrCreateDirectMutation()

  const debouncedQuery = useDebounce(query, 300)

  const { data, isFetching } = useSearchQuery(
    { workspaceId: workspaceId!, query: debouncedQuery },
    { skip: !workspaceId || debouncedQuery.length < 2 }
  )

  // Reset index on new results
  React.useEffect(() => {
    setActiveIndex(0)
  }, [data])

  React.useEffect(() => {
    if (debouncedQuery.length >= 2 && workspaceId) {
      console.log("Searching:", debouncedQuery);
      // useSearchQuery handles the actual call automatically based on dependencies
    }
  }, [debouncedQuery, workspaceId])

  const results = React.useMemo(() => {
    if (!data) return []
    const items: any[] = []

    if (data.users && data.users.length > 0) {
      items.push({ kind: "header", label: "Users" })
      data.users.slice(0, 5).forEach(u => items.push({ kind: "user", ...u }))
    }

    if (data.channels && data.channels.length > 0) {
      items.push({ kind: "header", label: "Channels" })
      data.channels.slice(0, 5).forEach(c => items.push({ kind: "channel", ...c }))
    }

    if (data.messages && data.messages.length > 0) {
      items.push({ kind: "header", label: "Messages" })
      data.messages.slice(0, 5).forEach(m => items.push({ kind: "message", ...m }))
    }

    return items
  }, [data])

  const actionableItems = results.filter(item => item.kind !== "header")

  const handleSelect = async (item: any) => {
    onClose()
    onQueryChange("")
    if (item.kind === "user") {
      try {
        const conversation = await getOrCreateDirect({ workspaceId: workspaceId!, userId: item.id }).unwrap()
        navigate(`/${workspaceId}/${conversation.id}`)
      } catch (error) {
        console.error("Failed to open DM", error)
      }
    } else if (item.kind === "channel") {
      navigate(`/${workspaceId}/${item.id}`)
    } else if (item.kind === "message") {
      navigate(`/${workspaceId}/${item.conversationId}?messageId=${item.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % actionableItems.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + actionableItems.length) % actionableItems.length)
    } else if (e.key === "Enter" && actionableItems[activeIndex]) {
      handleSelect(actionableItems[activeIndex])
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-2xl top-[15%] translate-y-0 focus:outline-none">
        <div className="bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-300">
          {/* Search Input */}
          <div className="flex items-center px-6 py-4 border-b border-border gap-4 bg-muted/30">
            <RiSearchLine className="h-6 w-6 text-muted-foreground shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-[18px] font-semibold tracking-tight placeholder:text-muted-foreground/40 text-foreground"
              placeholder="Search users, channels, or messages..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {isFetching && (
              <RiLoader4Line className="h-5 w-5 text-primary animate-spin" />
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-[10px] font-bold text-muted-foreground shadow-sm">
              <span className="tracking-widest">ESC</span>
            </div>
          </div>

          {/* Results List */}
          <ScrollArea className="flex-1 overflow-y-auto p-3 min-h-[160px]">
            {query.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <RiSearchLine className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-[22px] font-bold text-foreground tracking-tight">Global Search</h2>
                <p className="text-[14px] text-muted-foreground max-w-[280px] mt-2 font-medium leading-relaxed">Search for users, channels, and messages across your workspace.</p>
              </div>
            ) : actionableItems.length === 0 && !isFetching ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <h2 className="text-[20px] font-bold text-foreground tracking-tight">No matches found</h2>
                <p className="text-[14px] text-muted-foreground mt-1 font-medium">We couldn't find anything matching "{query}"</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {results.map((item) => {
                  if (item.kind === "header") {
                    return (
                      <div key={item.label} className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-4 first:mt-0">
                        {item.label}
                      </div>
                    )
                  }

                  const globalIndex = actionableItems.indexOf(item)
                  const isActive = globalIndex === activeIndex

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 outline-none",
                        isActive ? "bg-primary text-primary-foreground shadow-lg scale-[1.01]" : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-primary-foreground/20" : "bg-muted-foreground/10 group-hover:bg-muted-foreground/20"
                      )}>
                        {item.kind === "user" && (
                          <Avatar className="h-10 w-10 rounded-lg border border-border/20">
                            <AvatarImage src={item.imageUrl} />
                            <AvatarFallback className="bg-muted text-foreground font-bold">{item.fullName[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {item.kind === "channel" && <RiHashtag className="h-5 w-5" />}
                        {item.kind === "message" && <RiMessage2Line className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[16px] font-bold tracking-tight truncate">
                            <HighlightText
                              text={item.kind === "user" ? item.fullName : item.kind === "channel" ? item.name : item.senderName}
                              query={debouncedQuery}
                              isActive={isActive}
                            />
                          </span>
                          {item.kind === "message" && (
                            <span className={cn(
                              "text-[10px] font-bold shrink-0 px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                              isActive ? "bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                            )}>
                              #{item.conversationName}
                            </span>
                          )}
                        </div>
                        <div className={cn(
                          "text-[13px] truncate mt-0.5 font-medium",
                          isActive ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>
                          {item.kind === "user" ? item.email : item.kind === "channel" ? `Public Channel` : (
                            <HighlightText text={item.content} query={debouncedQuery} isActive={isActive} />
                          )}
                        </div>
                      </div>

                      <RiArrowRightUpLine className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive ? "translate-x-0 opacity-100" : "translate-x-[-8px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      )} />
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <kbd className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-border bg-background shadow-sm">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-border bg-background shadow-sm">↵</kbd>
                select
              </span>
            </div>
            <div className="flex items-center gap-2 opacity-60">
              Premium Design System
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HighlightText({ text, query, isActive }: { text: string; query: string; isActive?: boolean }) {
  if (!query) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className={cn(
              "rounded-sm px-0.5",
              isActive ? "bg-primary-foreground text-primary font-bold" : "bg-primary/20 text-primary font-bold"
            )}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}