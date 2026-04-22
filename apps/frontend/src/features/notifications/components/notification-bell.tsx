import React from "react"
import { RiNotification3Line, RiNotification3Fill, RiCheckDoubleLine, RiCloseLine, RiMessage3Line, RiEmotionHappyLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotification } from "@/features/notifications/context/NotificationContext"
import { useNavigate } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id)
    if (link) {
      navigate(link)
      setIsOpen(false)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground hover:bg-accent/50">
          {unreadCount > 0 ? (
            <>
              <RiNotification3Fill className="size-4 text-emerald-500" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </>
          ) : (
            <RiNotification3Line className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[340px] p-0 flex flex-col overflow-hidden bg-background border-border shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <RiCheckDoubleLine className="size-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={clearAll}
                title="Clear all"
              >
                <RiCloseLine className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 max-h-[400px]">
          {notifications.filter(n => !n.isRead).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <RiNotification3Line className="size-6 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground/80">You're all caught up!</p>
              <p className="text-xs mt-1 opacity-60">No new notifications right now.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.filter(n => !n.isRead).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  className={`
                    relative flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-border/30 last:border-0
                    hover:bg-accent/40 
                    ${!notification.isRead ? 'bg-primary/5' : ''}
                  `}
                >
                  {!notification.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}

                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.type === 'REACTION' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
                    }`}>
                    {notification.type === 'REACTION' ? (
                      <RiEmotionHappyLine className="size-4" />
                    ) : (
                      <RiMessage3Line className="size-4" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                    <p className="text-sm font-medium leading-none text-foreground flex items-center justify-between">
                      <span className="truncate pr-2">{notification.title}</span>
                      <span className="text-[10px] font-normal text-muted-foreground shrink-0">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
