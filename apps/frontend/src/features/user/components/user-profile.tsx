import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RiEdit2Line, RiSettings4Line, RiUserLine, RiTimeLine } from "@remixicon/react"
import type { User } from "@/lib/mock-data"

interface UserProfileProps {
  user: User
  trigger: React.ReactNode
}

export function UserProfile({ user, trigger }: UserProfileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l bg-card">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center justify-between">
            <span>Profile</span>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <RiEdit2Line className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <RiSettings4Line className="h-4 w-4" />
               </Button>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
             <Avatar className="h-40 w-40 rounded-2xl shadow-xl border-4 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-4xl">{user.initials}</AvatarFallback>
             </Avatar>
             <div className="text-center">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
             </div>
             <Button variant="outline" className="w-full rounded-xl">
                Edit Profile
             </Button>
          </div>

          <Separator />

          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                   <RiUserLine className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                   <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Display Name</span>
                   <span>{user.name}</span>
                </div>
             </div>

             <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                   <RiTimeLine className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                   <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Local Time</span>
                   <span>{new Date().toLocaleTimeString()}</span>
                </div>
             </div>
          </div>

          <Separator />

          <div className="space-y-4">
             <h3 className="font-bold text-sm">Contact Information</h3>
             <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex flex-col gap-1">
                   <span className="text-xs text-muted-foreground">Email Address</span>
                   <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{user.email}</span>
                </div>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
