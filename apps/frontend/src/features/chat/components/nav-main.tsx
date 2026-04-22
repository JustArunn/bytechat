import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RiLockFill } from "@remixicon/react"


export function NavMain({
  items,
  onSelect,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    action?: {
      icon: React.ReactNode
      onClick: () => void
    }
    items?: {
      id: string
      title: string
      url: string
      isActive?: boolean
      badge?: string | number

      type?: string
      actions?: {

        icon: React.ReactNode
        label: string
        onClick: (id: string) => void
      }[]
    }[]
  }[]
  onSelect?: (id: string, type: 'channel' | 'dm') => void
}) {
  return (
    <>
      {items.map((item) => (
        <SidebarGroup key={item.title}>
          <SidebarGroupLabel className="flex items-center justify-between group/label h-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {item.title}
            </span>
            {item.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  item.action?.onClick()
                }}
                className="opacity-0 group-hover/label:opacity-100 p-1 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-foreground"
              >
                {item.action.icon}
              </button>
            )}
          </SidebarGroupLabel>
          <SidebarMenu>
            {item.items?.map((subItem) => (
              <SidebarMenuItem key={subItem.id} className="group/item relative">
                <SidebarMenuButton
                  isActive={subItem.isActive}
                  onClick={() => onSelect?.(subItem.id, item.title === 'Channels' ? 'channel' : 'dm')}
                  className={`
                    w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-all pr-8
                    ${subItem.isActive
                      ? 'bg-muted text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 flex-1 truncate">
                    {item.title === 'Channels' ? (
                      <span className={`leading-none ${subItem.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {subItem.type === 'PRIVATE' ? (
                          <RiLockFill className="size-3.5 mb-0.5" />
                        ) : (
                          <span className="text-lg">#</span>
                        )}
                      </span>
                    ) : item.title === 'Direct Messages' ? (

                      <div className={`size-2 rounded-full shrink-0 ${subItem.isActive ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    ) : (
                      <div className="size-4 flex items-center justify-center">{item.icon}</div>
                    )}
                    <span className={`truncate flex-1 ${subItem.badge ? 'font-semibold text-foreground' : ''}`}>{subItem.title}</span>
                    {subItem.badge ? (
                      <span className="ml-auto shrink-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {typeof subItem.badge === 'number' && subItem.badge > 99 ? '99+' : subItem.badge}
                      </span>
                    ) : null}

                  </div>
                </SidebarMenuButton>

                {subItem.actions && subItem.actions.length > 0 && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 flex items-center gap-1">
                    {subItem.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(subItem.id);
                        }}
                        title={action.label}
                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
