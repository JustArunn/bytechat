import * as React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiArrowLeftLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { MessageSquare } from "lucide-react"
import { useLoginMutation, useGetMeQuery } from "@/features/auth/api/authApi"
import { useAcceptInviteBySlugMutation } from "@/features/workspace/api/workspaceApi"

import { toast } from "sonner"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const [acceptInviteBySlug] = useAcceptInviteBySlugMutation()
  const { data: me } = useGetMeQuery()

  const navigate = useNavigate()

  React.useEffect(() => {
    if (me) {
      if (me.primarySlug) {
        navigate(`/${me.primarySlug}`)
      } else if (me.workspaces && me.workspaces.length > 0) {
        navigate(`/${me.workspaces[0].slug}`)
      } else {
        navigate("/onboarding")
      }
    }
  }, [me, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await login({ email, password }).unwrap()
      toast.success("Welcome back!")

      const searchParams = new URLSearchParams(window.location.search)
      const invitedWorkspaceSlug = searchParams.get("workspace")

      if (invitedWorkspaceSlug) {
        try {
          const workspace = await acceptInviteBySlug(invitedWorkspaceSlug).unwrap()
          toast.success(`Joined ${workspace.name}!`)
          navigate(`/${workspace.slug}`)
          return
        } catch (err) {
          console.error("Auto-join failed after login", err)
        }
      }

      // Redirect to user's primary workspace or onboarding
      const search = window.location.search;
      if (search.includes('workspace=')) {
        navigate(`/onboarding${search}`)
      } else if (user.primarySlug) {
        navigate(`/${user.primarySlug}`)
      } else if (user.workspaces && user.workspaces.length > 0) {
        navigate(`/${user.workspaces[0].slug}`)
      } else {
        navigate(`/onboarding${search}`)
      }
    } catch (err: any) {
      toast.error(err.data?.message || "Invalid credentials")
    }


  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/20 relative">


      <div className="w-full max-w-[320px] space-y-6 relative">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-2"
        >
          <RiArrowLeftLine className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[11px] font-medium uppercase tracking-widest">Back</span>
        </Link>
        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="size-10 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
            <MessageSquare className="size-5 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-[24px] font-semibold tracking-tight">Welcome back</h1>
            <p className="text-[14px] text-muted-foreground">
              New to ByteChat?{" "}
              <Link to="/signup" className="text-primary hover:underline underline-offset-4 font-medium">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground ml-1">Email</label>
            <Input
              type="email"
              placeholder="m@example.com"
              className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-10 rounded-md text-[14px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-medium text-muted-foreground ml-1">Password</label>
            </div>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-10 rounded-md text-[14px] pr-10 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 rounded-md font-medium transition-all active:scale-[0.98] mt-2 text-[14px] shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Continue"}
          </Button>
        </form>



        {/* Footer */}
        <p className="text-center text-[12px] text-muted-foreground leading-relaxed">
          By signing in, you agree to our <br />
          <a href="#" className="text-foreground hover:underline underline-offset-2 font-medium">Terms</a> and <a href="#" className="text-foreground hover:underline underline-offset-2 font-medium">Privacy</a>
        </p>
      </div>
    </div>
  )
}
