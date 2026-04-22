import * as React from "react"
import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiArrowLeftLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { MessageSquare } from "lucide-react"
import { useRegisterMutation, useGetMeQuery } from "@/features/auth/api/authApi"
import { useAcceptInviteBySlugMutation } from "@/features/workspace/api/workspaceApi"
import { toast } from "sonner"

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get("email")
  const [email, setEmail] = useState(emailParam || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordsMatch = password && confirmPassword ? password === confirmPassword : null
  const { data: me } = useGetMeQuery()
  const [register, { isLoading }] = useRegisterMutation()
  const [acceptInviteBySlug] = useAcceptInviteBySlugMutation()
  const navigate = useNavigate()


  React.useEffect(() => {
    if (me) {
      const primarySlug = me.primarySlug || (me.workspaces && me.workspaces.length > 0 ? me.workspaces[0].slug : null);
      if (primarySlug) {
        navigate(`/${primarySlug}`)
      } else {
        navigate("/onboarding")
      }
    }
  }, [me, navigate])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    try {
      const user = await register({ email, password, confirmPassword, fullName }).unwrap()
      toast.success(`Welcome to ByteChat, ${user.fullName || "new user"}!`)

      const invitedWorkspaceSlug = searchParams.get("workspace")
      if (invitedWorkspaceSlug) {
        try {
          const workspace = await acceptInviteBySlug(invitedWorkspaceSlug).unwrap()
          toast.success(`Joined ${workspace.name}!`)
          navigate(`/${workspace.slug}`)
          return
        } catch (err) {
          console.error("Auto-join failed after signup", err)
        }
      }

      navigate(`/onboarding${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)
    } catch (err: any) {
      toast.error(err.data?.message || "Registration failed")
    }


  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/20 relative">


      <div className="w-full max-w-[340px] space-y-6 relative">
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
            <h1 className="text-[24px] font-semibold tracking-tight">Create an account</h1>
            <p className="text-[14px] text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline underline-offset-4 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground ml-1">Full Name</label>
            <Input
              placeholder="John Doe"
              className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-10 rounded-md text-[14px]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground ml-1">Email</label>
            <Input
              type="email"
              placeholder="m@example.com"
              className="bg-secondary/30 border-transparent focus:border-primary/20 focus:ring-primary/10 h-10 rounded-md text-[14px] disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!emailParam}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground ml-1">Password</label>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[12px] font-medium text-muted-foreground">Confirm Password</label>
              {passwordsMatch !== null && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${passwordsMatch ? 'text-emerald-500' : 'text-destructive'}`}>
                  {passwordsMatch ? 'Match' : 'No Match'}
                </span>
              )}
            </div>
            <div className="relative group">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`bg-secondary/30 border-transparent focus:ring-primary/10 h-10 rounded-md text-[14px] pr-10 transition-all ${passwordsMatch === true ? 'border-emerald-500/50' :
                  passwordsMatch === false ? 'border-destructive/50' : ''
                  }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 rounded-md font-medium transition-all active:scale-[0.98] mt-2 text-[14px] shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Get Started"}
          </Button>
        </form>



        {/* Footer */}
        <p className="text-center text-[12px] text-muted-foreground leading-relaxed">
          By signing up, you agree to our <br />
          <a href="#" className="text-foreground hover:underline underline-offset-2 font-medium">Terms</a> and <a href="#" className="text-foreground hover:underline underline-offset-2 font-medium">Privacy</a>
        </p>
      </div>
    </div>
  )
}
