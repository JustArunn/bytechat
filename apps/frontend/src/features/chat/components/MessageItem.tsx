import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RiEmotionLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiCloseLine, RiReplyLine } from "@remixicon/react"

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"]

interface MessageItemProps {
  message: any
  currentUser: any
  isDirect: boolean
  isOwn: boolean
  showSenderName: boolean
  editingMessageId: string | null
  editingContent: string
  emojiPickerMsgId: string | null
  onStartEdit: (message: any) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onSetEditingContent: (content: string) => void
  onDeleteMessage: (id: string) => void
  onReact: (messageId: string, emoji: string) => void
  onReply: (message: any) => void
  onOpenProfile: (message: any) => void
  onSetEmojiPickerMsgId: (id: string | null) => void
}

export function MessageItem({
  message,
  currentUser,
  isOwn,
  showSenderName,
  editingMessageId,
  editingContent,
  emojiPickerMsgId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetEditingContent,
  onDeleteMessage,
  onReact,
  onReply,
  onOpenProfile,
  onSetEmojiPickerMsgId
}: MessageItemProps) {
  const isEditing = editingMessageId === message.id
  const msgReactions = message.reactions || []
  const replyInfo = message.replyTo

  return (
    <div
      id={`message-${message.id}`}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group relative px-4 py-1.5 transition-all duration-300`}
    >
      {showSenderName && (
        <span
          className="text-[12px] font-bold text-primary ml-10 mb-1 cursor-pointer hover:underline tracking-tight"
          onClick={() => onOpenProfile(message)}
        >
          {message.senderName}
        </span>
      )}

      <div className={`relative flex items-end gap-3 max-w-[85%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} z-10`}>
        {!isOwn && (
          <Avatar className="size-8 rounded-lg shrink-0 mb-1 cursor-pointer ring-1 ring-border shadow-sm" onClick={() => onOpenProfile(message)}>
            <AvatarImage src={message.senderImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`} />
            <AvatarFallback className="text-[10px] bg-muted font-bold">{message.senderName?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col min-w-0 flex-1 ${isOwn ? 'items-end' : 'items-start'}`}>
          {isEditing ? (
            <div className="w-full sm:w-[400px] space-y-3 bg-card border border-border rounded-xl p-4 shadow-xl">
              <textarea
                value={editingContent}
                onChange={(e) => onSetEditingContent(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg p-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px] font-medium"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-8 text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-4 rounded-md" onClick={() => onSaveEdit(message.id)}>
                  <RiCheckLine className="size-4 mr-1.5" />Save Changes
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-[12px] font-bold text-muted-foreground hover:text-foreground px-4 rounded-md" onClick={onCancelEdit}>
                  <RiCloseLine className="size-4 mr-1.5" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group/content">
              <div
                className={`relative rounded-xl px-4 py-2 shadow-sm max-w-full transition-all duration-200 border ${isOwn
                  ? 'bg-primary text-primary-foreground border-primary rounded-br-sm shadow-primary/10'
                  : 'bg-card text-foreground border-border rounded-bl-sm'
                  }`}
              >
                {replyInfo && (
                  <div className={`mb-2 pl-3 border-l-2 rounded-sm text-[11px] font-medium py-1 bg-muted/20 ${isOwn ? 'border-primary-foreground/50' : 'border-primary/40'}`}>
                    <p className="font-bold mb-0.5">{replyInfo.senderName}</p>
                    <p className="truncate max-w-[200px] opacity-80">{replyInfo.content}</p>
                  </div>
                )}
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word font-medium">{message.content}</p>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1.5 block ${isOwn ? 'text-right pr-1' : 'pl-1'}`}>
                {(!message.timestamp || message.timestamp.includes("05:30")) ? 'Just now' : message.timestamp}
              </span>

              {msgReactions.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {msgReactions.map((r: any) => (
                    <button
                      key={r.emoji}
                      onClick={() => onReact(message.id, r.emoji)}
                      title={r.userNames.join(', ')}
                      className={`flex items-center gap-1 text-[12px] px-2 py-1 rounded-md border transition-all active:scale-95 ${r.userIds.includes(currentUser?.id || '')
                        ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm shadow-primary/10'
                        : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:bg-muted font-medium'
                        }`}
                    >
                      {r.emoji} <span className="text-[10px] font-bold">{r.userIds.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto absolute ${isOwn ? 'right-full mr-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 z-50`}>
          <div className="flex items-center gap-1 bg-secondary/90 backdrop-blur-md border border-border p-1 rounded-xl shadow-xl animate-in fade-in zoom-in-90 duration-200">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); onSetEmojiPickerMsgId(emojiPickerMsgId === message.id ? null : message.id) }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
              >
                <RiEmotionLine className="size-4" />
              </button>
              {emojiPickerMsgId === message.id && (
                <div
                  onClick={e => e.stopPropagation()}
                  className={`absolute z-50 bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'} bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl flex gap-1 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10`}
                >
                  {QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onReact(message.id, emoji)}
                      className="text-xl hover:scale-125 transition-transform leading-none p-1.5 rounded-lg hover:bg-primary/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onReply(message)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
            >
              <RiReplyLine className="size-4" />
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onStartEdit(message)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
                >
                  <RiEditLine className="size-4" />
                </button>
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active:scale-90"
                >
                  <RiDeleteBinLine className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
