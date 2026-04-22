import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { RiArrowUpDownLine, RiSparklingLine, RiCheckboxCircleLine, RiBankCardLine, RiNotificationLine, RiLogoutBoxLine } from "@remixicon/react"
import { useLogoutMutation, useGetMeQuery } from "@/features/auth/api/authApi"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { UserProfileDialog } from "./user-profile-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import * as React from "react"
import { useDispatch } from "react-redux"
import { apiSlice } from "@/store/api/apiSlice"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [logout] = useLogoutMutation()
  const { data: me } = useGetMeQuery()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(apiSlice.util.resetApiState());
      toast.success("Logged out");
      navigate("/", { replace: true });
    } catch (error) {
      // Even if server call fails, we should clear local state
      dispatch(apiSlice.util.resetApiState());
      navigate("/", { replace: true });
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <RiArrowUpDownLine className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2">
                  <RiSparklingLine className="size-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="gap-2" 
                  onSelect={() => setIsProfileOpen(true)}
                >
                  <RiCheckboxCircleLine className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <RiBankCardLine className="size-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <RiNotificationLine className="size-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2" 
                onSelect={() => setIsLogoutConfirmOpen(true)}
              >
                <RiLogoutBoxLine className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <UserProfileDialog 
        user={me}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description={
          <>
            Are you sure you want to log out of <span className="font-bold text-white">{user.name}'s</span> account?
          </>
        }
        confirmText="Log Out"
        variant="destructive"
      />
    </>
  )
}
