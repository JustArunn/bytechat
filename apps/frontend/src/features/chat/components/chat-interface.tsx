import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RiHashtag, RiLockFill } from "@remixicon/react"

import { UserProfileDialog } from "@/features/user/components/user-profile-dialog"
import { ChannelDetailsDialog } from "./channel-details-dialog"
import { useSearchParams } from "react-router-dom"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useWebSocket } from "@/features/chat/context/WebSocketContext"
import { useToggleReactionMutation } from "@/features/chat/api/messageApi"
import { ChatHeader } from "./ChatHeader"
import { MessageItem } from "./MessageItem"
import { ChatInput } from "./ChatInput"

interface Message {
  id: string
  userId: string
  senderName: string
  senderImageUrl?: string
  content: string
  timestamp: string
  reactions?: { emoji: string; count: number; userIds: string[]; userNames: string[] }[]
  replyTo?: { id: string; senderName: string; content: string }
}

interface ChatInterfaceProps {
  conversationId?: string
  channelName: string
  workspaceName?: string
  members?: any[]
  messages: any[]
  onSendMessage: (content: string, replyToId?: string) => void
  onUpdateMessage: (id: string, content: string) => void
  onDeleteMessage: (id: string) => void
  isDirect?: boolean
  type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT'
  channelImageUrl?: string
}


export function ChatInterface({
  conversationId,
  channelName,
  workspaceName,
  members = [],
  messages,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  isDirect = false,
  type,
  channelImageUrl
}: ChatInterfaceProps) {



  const { data: currentUser } = useGetMeQuery()
  const { subscribe, sendMessage: wsSendMessage, isConnected } = useWebSocket()
  const [toggleReaction] = useToggleReactionMutation()
  const [inputValue, setInputValue] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [searchParams] = useSearchParams()
  const targetMessageId = searchParams.get("messageId")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set())
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null)
  const [editingContent, setEditingContent] = React.useState("")
  const [emojiPickerMsgId, setEmojiPickerMsgId] = React.useState<string | null>(null)
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const lastTypingSentRef = React.useRef<number>(0)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue, replyingTo?.id)
    setInputValue("")
    setReplyingTo(null)
  }

  const handleReact = (messageId: string, emoji: string) => {
    if (!conversationId) return
    toggleReaction({ messageId, emoji, channelId: conversationId })
    setEmojiPickerMsgId(null)
  }

  const handleStartEdit = (message: any) => {
    setEditingMessageId(message.id)
    setEditingContent(message.content)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) return
    onUpdateMessage(id, editingContent)
    setEditingMessageId(null)
  }

  const handleOpenProfile = (message: any) => {
    setSelectedUser({
      id: message.userId,
      fullName: message.senderName,
      imageUrl: message.senderImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`
    })
    setIsProfileOpen(true)
  }

  const handleOpenHeaderProfile = () => {
    if (isDirect) {
      const otherMember = members.find((m: any) => m.id !== currentUser?.id)
      if (otherMember) { setSelectedUser(otherMember); setIsProfileOpen(true) }
    }
  }

  React.useEffect(() => {
    if (!conversationId || !isConnected) return
    const unsubscribeTyping = subscribe(`/topic/chat/${conversationId}/typing`, (event: any) => {
      if (event.senderId === currentUser?.id) return
      setTypingUsers((prev) => {
        const next = new Set(prev)
        if (event.type === 'TYPING') { next.add(event.senderName) }
        else { next.delete(event.senderName) }
        return next
      })
    })
    return () => { unsubscribeTyping() }
  }, [conversationId, subscribe, currentUser?.id, isConnected])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (conversationId && currentUser && isConnected) {
      const now = Date.now()
      if (now - lastTypingSentRef.current > 2000) {
        wsSendMessage(`/app/chat/${conversationId}/typing`, { type: 'TYPING', conversationId, senderId: currentUser.id, senderName: currentUser.fullName })
        lastTypingSentRef.current = now
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        wsSendMessage(`/app/chat/${conversationId}/typing`, { type: 'STOP_TYPING', conversationId, senderId: currentUser.id, senderName: currentUser.fullName })
        lastTypingSentRef.current = 0
      }, 3000)
    }
  }

  const prevMessagesLengthRef = React.useRef(-1)

  React.useEffect(() => {
    prevMessagesLengthRef.current = -1
  }, [conversationId])

  React.useEffect(() => {
    if (targetMessageId) {
      setTimeout(() => {
        const element = document.getElementById(`message-${targetMessageId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.classList.add("ring-2", "ring-primary/40")
          setTimeout(() => element.classList.remove("ring-2", "ring-primary/40"), 3000)
        }
      }, 100)
      return
    }
    if (scrollRef.current && messages.length !== prevMessagesLengthRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      prevMessagesLengthRef.current = messages.length
    }
  }, [messages, targetMessageId, conversationId])

  React.useEffect(() => {
    const handler = () => setEmojiPickerMsgId(null)
    if (emojiPickerMsgId) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [emojiPickerMsgId])

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ChatHeader 
        channelName={channelName}
        workspaceName={workspaceName}
        isDirect={isDirect}
        type={type}
        channelImageUrl={channelImageUrl}
        members={members}
        onOpenProfile={handleOpenHeaderProfile}
        onOpenDetails={() => setIsDetailsOpen(true)}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="flex flex-col items-start px-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="size-24 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-2xl relative mb-6 group">
            {isDirect ? (
              <Avatar className="size-full rounded-xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={channelImageUrl} />
                <AvatarFallback className="text-4xl bg-muted font-bold">{channelName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="relative">
                <RiHashtag className="size-12 text-primary transition-transform group-hover:rotate-12 duration-300" />
                {type === 'PRIVATE' && (
                  <div className="absolute -top-1 -right-1 size-6 rounded-full bg-background border border-border flex items-center justify-center shadow-lg">
                    <RiLockFill className="size-3 text-primary" />
                  </div>
                )}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 size-6 rounded-full bg-primary border-4 border-background" />
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {isDirect ? channelName : `Welcome to #${channelName}`}
              {isDirect && <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest mt-1">Direct</span>}
            </h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              {isDirect ? (
                <>This is the very beginning of your direct message history with <span className="text-primary font-medium">@{channelName}</span>.</>
              ) : (
                <>This is the very beginning of the <span className="text-primary font-medium">#{channelName}</span> channel.</>
              )}
            </p>
          </div>
          <div className="w-full h-px bg-linear-to-r from-border/50 via-border to-transparent mt-12" />
        </div>

        <div className="flex flex-col gap-1 pb-2">
          {messages.map((message, idx) => {
            const isOwn = currentUser?.id === message.userId
            const prevMsg = idx > 0 ? messages[idx - 1] : null
            const showSenderName = !isDirect && !isOwn && prevMsg?.userId !== message.userId

            return (
              <MessageItem 
                key={message.id}
                message={message}
                currentUser={currentUser}
                isDirect={isDirect}
                isOwn={isOwn}
                showSenderName={showSenderName}
                editingMessageId={editingMessageId}
                editingContent={editingContent}
                emojiPickerMsgId={emojiPickerMsgId}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onSetEditingContent={setEditingContent}
                onDeleteMessage={onDeleteMessage}
                onReact={handleReact}
                onReply={setReplyingTo}
                onOpenProfile={handleOpenProfile}
                onSetEmojiPickerMsgId={setEmojiPickerMsgId}
              />
            )
          })}
        </div>
      </div>

      <ChatInput 
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSendMessage={handleSendMessage}
        channelName={channelName}
        isDirect={isDirect}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        typingUsers={typingUsers}
        inputRef={inputRef}
      />

      <UserProfileDialog user={selectedUser} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ChannelDetailsDialog conversationId={conversationId || null} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </div>
  )
}
