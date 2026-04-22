import * as React from "react"
import { Button } from "@/components/ui/button"
import { RiSendPlane2Line, RiAddLine, RiEmotionLine, RiReplyLine, RiCloseLine } from "@remixicon/react"

interface ChatInputProps {
  inputValue: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSendMessage: () => void
  channelName: string
  isDirect: boolean
  replyingTo: any | null
  onCancelReply: () => void
  typingUsers: Set<string>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function ChatInput({
  inputValue,
  onInputChange,
  onSendMessage,
  channelName,
  isDirect,
  replyingTo,
  onCancelReply,
  typingUsers,
  inputRef
}: ChatInputProps) {
  return (
    <div className="flex flex-col shrink-0 bg-background">
      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-6 py-1.5 text-[11px] text-muted-foreground italic animate-in fade-in slide-in-from-bottom-1 font-medium">
          <span className="font-bold text-primary">{Array.from(typingUsers).join(', ')}</span> {typingUsers.size === 1 ? 'is' : 'are'} typing
          <span className="inline-flex gap-0.5 ml-1.5">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
          </span>
        </div>
      )}

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="mx-4 mb-2 px-4 py-2 bg-muted/50 border border-border rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-6 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
              <RiReplyLine className="size-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-primary tracking-tight">{replyingTo.senderName}</p>
              <p className="text-[12px] text-muted-foreground truncate opacity-80">{replyingTo.content.substring(0, 100)}</p>
            </div>
          </div>
          <button onClick={onCancelReply} className="shrink-0 text-muted-foreground hover:text-destructive p-1.5 transition-colors rounded-lg hover:bg-destructive/10">
            <RiCloseLine className="size-4" />
          </button>
        </div>
      )}

      {/* Message Input Container */}
      <div className="px-4 pb-5 pt-1">
        <div className="flex items-end gap-3 border border-border rounded-xl bg-card focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-300 shadow-sm px-4 py-2 group">
          <div className="flex items-center gap-1 mb-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors">
              <RiAddLine className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors">
              <RiEmotionLine className="size-4" />
            </Button>
          </div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSendMessage()
              }
            }}
            placeholder={isDirect ? `Message ${channelName}` : `Message #${channelName}`}
            className="flex-1 min-h-[40px] max-h-[200px] bg-transparent border-none focus:outline-none resize-none text-[15px] font-medium placeholder:text-muted-foreground/40 py-2 leading-relaxed"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl shadow-lg active:scale-90 transition-all bg-primary text-primary-foreground hover:bg-primary/90 mb-0.5 shadow-primary/20 disabled:opacity-30 disabled:shadow-none"
            disabled={!inputValue.trim()}
            onClick={onSendMessage}
          >
            <RiSendPlane2Line className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
