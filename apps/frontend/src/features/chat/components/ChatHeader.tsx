import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RiStarLine, RiHashtag, RiInformationLine, RiArrowDownSLine, RiLockFill } from "@remixicon/react"
import { Separator } from "@/components/ui/separator"

interface ChatHeaderProps {
  channelName: string
  workspaceName?: string
  isDirect: boolean
  type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT'
  channelImageUrl?: string
  members: any[]
  onOpenProfile: () => void
  onOpenDetails: () => void
}

export function ChatHeader({
  channelName,
  workspaceName,
  isDirect,
  type,
  channelImageUrl,
  members,
  onOpenProfile,
  onOpenDetails
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-1.5 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10 shrink-0 border-border">
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 ${isDirect ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onOpenProfile}
        >
          {isDirect ? (
            <Avatar className="size-6 rounded-md">
              <AvatarImage src={channelImageUrl} />
              <AvatarFallback className="text-[10px] bg-muted">{channelName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : type === 'PRIVATE' ? (
            <RiLockFill className="w-3.5 h-3.5 text-primary mb-0.5" />
          ) : (
            <RiHashtag className="w-4 h-4 text-muted-foreground" />
          )}
          <h2 className="font-bold text-sm tracking-tight">{channelName}</h2>
          <RiArrowDownSLine className="size-3.5 text-muted-foreground" />
        </div>

        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-yellow-500 transition-colors">
          <RiStarLine className="w-3 h-3" />
        </Button>
        <Separator orientation="vertical" className="h-2.5 mx-0.5" />
        <span className="text-[10px] text-muted-foreground font-medium truncate opacity-60">{workspaceName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {!isDirect && (
          <div className="flex items-center -space-x-2 mr-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onOpenDetails}>
            {members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="size-6 border-2 border-background ring-1 ring-border">
                <AvatarImage src={member.imageUrl} />
                <AvatarFallback className="text-[8px]">{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="size-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground z-10">
                +{members.length - 3}
              </div>
            )}
          </div>
        )}
        {!isDirect && (
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={onOpenDetails}>
            <RiInformationLine className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </header>
  )
}
