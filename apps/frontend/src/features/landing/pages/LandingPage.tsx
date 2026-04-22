import * as React from "react"
import { Link } from "react-router-dom"
import {
  MessageSquare,
  Shield,
  Zap,
  Search,
  Layers,
  Globe,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Layout,
  Lock,
  Menu,
  X,
  Mail,
  CheckCircle,
  Briefcase,
  Code,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RiGithubFill, RiTwitterFill } from "@remixicon/react"

// --- Reusable Components ---

const SectionWrapper = ({
  children,
  className,
  id,
  lightBg = false
}: {
  children: React.ReactNode,
  className?: string,
  id?: string,
  lightBg?: boolean
}) => (
  <section
    id={id}
    className={cn(
      "py-16 md:py-24 px-4 overflow-hidden transition-colors",
      lightBg ? "bg-secondary/10" : "bg-background",
      className
    )}
  >
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
)

const PageHeader = ({
  badge,
  title,
  description,
  centered = true
}: {
  badge?: string,
  title: string | React.ReactNode,
  description?: string,
  centered?: boolean
}) => (
  <div className={cn("space-y-4 mb-16", centered ? "text-center mx-auto max-w-3xl" : "text-left")}>
    {badge && (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary uppercase tracking-wider animate-in fade-in zoom-in">
        <Sparkles className="size-3" />
        {badge}
      </div>
    )}
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance leading-tight">
      {title}
    </h2>
    {description && (
      <p className="text-lg text-muted-foreground font-medium leading-relaxed">
        {description}
      </p>
    )}
  </div>
)

const FeatureCard = ({
  title,
  description,
  icon: Icon
}: {
  title: string,
  description: string,
  icon: any
}) => (
  <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-all duration-200 group rounded-2xl overflow-hidden">
    <CardHeader className="p-6">
      <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="size-5 text-primary" />
      </div>
      <CardTitle className="text-lg font-bold">{title}</CardTitle>
      <CardDescription className="text-muted-foreground text-sm leading-relaxed pt-1">
        {description}
      </CardDescription>
    </CardHeader>
  </Card>
)

// --- Main Page Component ---

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      <main className="">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <Features />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}

function Navbar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  return (
    <nav className="fixed top-0 w-full z-100 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="size-8 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
              <MessageSquare className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ByteChat</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium h-9 px-4">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-5 h-9 font-medium shadow-sm transition-all active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground rounded-md h-9 w-9">
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            <NavLinks onClick={() => setIsOpen(false)} />
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full h-10 rounded-md">Sign In</Button>
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-10 bg-primary text-primary-foreground rounded-md">Get Started Free</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLinks({ onClick }: { onClick?: () => void }) {
  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ]
  return (
    <>
      {links.map(link => (
        <a
          key={link.label}
          href={link.href}
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </a>
      ))}
    </>
  )
}

function Hero() {
  return (
    <SectionWrapper className="relative pt-24 pb-20 md:pt-32 md:pb-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 opacity-50" />

      <div className="text-center space-y-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary uppercase tracking-wider animate-in fade-in zoom-in duration-700">
          <Sparkles className="size-3" />
          The future of team collaboration
        </div>

        <h1 className="text-foreground text-4xl sm:text-5xl sm:leading-none lg:text-7xl">
          Your team's entire <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">workspace, unified.</span>
        </h1>

        <p className="max-w-[600px] mx-auto pt-2 text-foreground my-3 text-sm sm:mt-5 lg:mb-0 sm:text-base lg:text-lg">
          ByteChat brings together messaging, files, and tools in a sleek, high-performance workspace. Designed for speed, built for security.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/signup">
            <Button className="h-11 px-8 rounded-md text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/10 transition-all active:scale-95">
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="h-11 px-8 rounded-md text-base font-semibold border-border hover:bg-secondary/50">
              Book a Demo
            </Button>
          </Link>
        </div>

        <SocialProof />
      </div>
    </SectionWrapper>
  )
}

function SocialProof() {
  const logos = [
    "PWC", "Pika", "Humata", "Ludio", "LangChain", "Stripe", "Vercel", "Linear", "Airbnb", "GitHub", "Notion"
  ]
  // Duplicate logos for seamless marquee
  const marqueeLogos = [...logos, ...logos]

  return (
    <div className="mt-24 w-full overflow-hidden relative">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 w-32 h-full bg-linear-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 w-32 h-full bg-linear-to-l from-background to-transparent z-10" />

      <div className="flex whitespace-nowrap animate-marquee">
        {marqueeLogos.map((logo, i) => (
          <span
            key={`${logo}-${i}`}
            className="text-xl md:text-2xl font-black italic tracking-tighter cursor-default mx-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-500"
          >
            {logo}
          </span>
        ))}
      </div>
      <p className="mt-12 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
        Trusted by fast-growing companies worldwide
      </p>
    </div>
  )
}

function ProblemSection() {
  const painPoints = [
    {
      title: "Context Fragmentation",
      desc: "Information is scattered across email, chat, and docs, making it impossible to stay in sync.",
      icon: Layers,
      color: "text-red-400"
    },
    {
      title: "Notification Fatigue",
      desc: "Non-stop pings and irrelevant noise kill deep work and productivity.",
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      title: "Security Silos",
      desc: "Legacy tools lack the granular control and modern encryption needed for sensitive work.",
      icon: Lock,
      color: "text-blue-400"
    }
  ]

  return (
    <SectionWrapper>
      <PageHeader
        title={<>Collaboration shouldn't feel <br className="hidden md:block" /> like a full-time job.</>}
        description="Most communication tools were built for yesterday's office. Today's teams need something faster, smarter, and more focused."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {painPoints.map(point => (
          <Card key={point.title} className="p-6 rounded-2xl bg-secondary/30 border-border/50 space-y-4">
            <div className="size-10 rounded-md bg-background border border-border flex items-center justify-center shadow-sm">
              <point.icon className={cn("size-5", point.color)} />
            </div>
            <h3 className="text-lg font-bold">{point.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{point.desc}</p>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  )
}

function SolutionSection() {
  return (
    <SectionWrapper lightBg>
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
            The ByteChat Edge
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            The clarity your team <br /> deserves, out of the box.
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            ByteChat isn't just another chat app. It's a productivity engine that helps you reclaim your time and focus on what matters.
          </p>

          <ul className="space-y-4">
            {["Real-time synchronization across all devices", "Granular channel permissions and security", "Built-in AI for thread summarization", "Global edge network for zero-latency"].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="size-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <a href="#features">
              <Button className="h-10 rounded-md px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
                Explore Our Approach
              </Button>
            </a>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="relative rounded-2xl bg-card border border-border shadow-2xl p-3 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070"
              className="rounded-xl shadow-sm"
              alt="Team Collaboration"
            />
            <div className="absolute top-8 right-8 p-4 bg-background/90 backdrop-blur border border-border rounded-xl shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">New Pulse</p>
                  <p className="text-xs font-bold">Team speed up by 40%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

function Features() {
  const features = [
    { title: "Real-time Messaging", description: "Experience zero-latency conversations with our custom-built WebSocket infrastructure.", icon: Zap },
    { title: "Smart Channels", description: "Organize work into dedicated spaces for projects, departments, or casual syncs.", icon: Layout },
    { title: "Global Search", description: "Find anything in seconds—messages, files, or links across your entire history.", icon: Search },
    { title: "Enterprise Security", description: "E2E encryption and granular access controls keep your data safe and compliant.", icon: Shield },
    { title: "AI Thread Summary", description: "Catch up on long discussions in seconds with our integrated AI summarization.", icon: Sparkles },
    { title: "Rich Integrations", description: "Connect GitHub, Figma, and Google Workspace to bring your workflow into focus.", icon: Layers }
  ]

  return (
    <SectionWrapper id="features">
      <PageHeader
        title="Built for modern workflows"
        description="Every feature is designed to eliminate friction and maximize output."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(f => (
          <FeatureCard key={f.title} {...f} />

        ))}
      </div>
    </SectionWrapper>
  )
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Create Workspace", desc: "Set up your company hub in less than 60 seconds." },
    { num: "02", title: "Invite Your Team", desc: "Sync with Google or Slack to bring everyone onboard instantly." },
    { num: "03", title: "Communicate Better", desc: "Start collaborating in channels and watch productivity soar." }
  ]

  return (
    <SectionWrapper lightBg>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Zero to hero in <br /> three simple steps.</h2>
          <div className="space-y-6">
            {steps.map(step => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="text-3xl font-black text-primary/10 tabular-nums">{step.num}</div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold leading-none">{step.title}</h4>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative p-3 bg-card border border-border rounded-2xl shadow-xl">
          <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2074"
              alt="Team Collaboration"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 p-4 bg-primary text-primary-foreground rounded-xl shadow-lg animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Ready to go</span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

function UseCases() {
  const cases = [
    { type: "Startups", desc: "Move fast and ship daily with high-intensity communication.", icon: Rocket },
    { type: "Developers", desc: "Deep integrations with GitHub, GitLab, and Linear.", icon: Code },
    { type: "Remote Teams", desc: "Build culture and connection regardless of timezones.", icon: Globe },
    { type: "Enterprise", desc: "SOC2 compliance and advanced admin controls for scale.", icon: Briefcase }
  ]

  return (
    <SectionWrapper>
      <PageHeader title="Tailored for your team's size" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.map(c => (
          <div key={c.type} className="p-6 rounded-2xl border border-border bg-secondary/10 hover:bg-secondary/20 transition-all cursor-default group">
            <div className="size-10 rounded-md bg-background border border-border flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:border-transparent">
              <c.icon className="size-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">{c.type}</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "Perfect for side projects and small trials.",
      features: ["Unlimited messages", "Up to 5 channels", "Standard integrations", "1GB storage"],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      desc: "For growing teams that need more power.",
      features: ["Unlimited channels", "Advanced AI summary", "Priority support", "10GB storage", "Custom emojis"],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Scale with confidence and full control.",
      features: ["SSO & SAML", "Unlimited storage", "Dedicated success manager", "White-glove onboarding"],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <SectionWrapper id="pricing">
      <PageHeader
        title="Fair pricing for any scale"
        description="Start free, upgrade as you grow. No hidden fees."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.name} className={cn(
            "relative p-8 rounded-2xl border flex flex-col transition-all",
            plan.popular ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card shadow-sm"
          )}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
                Most Popular
              </div>
            )}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-muted-foreground font-medium">/mo</span>}
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{plan.desc}</p>
            </div>

            <ul className="space-y-3.5 mb-10 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup">
              <Button className={cn(
                "w-full h-10 rounded-md font-bold transition-all active:scale-[0.98]",
                plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              )}>
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

function Testimonials() {
  const reviews = [
    { name: "Sarah Chen", role: "CTO @ TechFlow", content: "ByteChat has completely transformed how our engineering team works. The context fragmentation we used to feel is gone.", avatar: "SC" },
    { name: "Marc Aubert", role: "Design Lead @ Prism", content: "Sleek, fast, and actually intuitive. The best Slack alternative we've ever tried.", avatar: "MA" }
  ]

  return (
    <SectionWrapper lightBg>
      <PageHeader title={<>Loved by the teams <br className="hidden md:block" /> building the future.</>} />

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {reviews.map(r => (
          <Card key={r.name} className="p-8 rounded-2xl bg-card border-border shadow-sm text-left space-y-6">
            <p className="text-lg font-medium leading-relaxed italic text-muted-foreground">"{r.content}"</p>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">{r.avatar}</div>
              <div>
                <h4 className="font-bold text-sm leading-none mb-1">{r.name}</h4>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  const questions = [
    { q: "Is ByteChat really faster than Slack?", a: "Yes. Our architecture is built on a global edge network with custom WebSocket protocols, resulting in near-zero latency worldwide." },
    { q: "Can we import our data from Slack?", a: "Absolutely. Our 1-click importer brings over all your channels, users, and message history in minutes." },
    { q: "How secure is ByteChat?", a: "We use E2E encryption for sensitive data, are SOC2 Type II compliant, and offer self-hosting options for Enterprise customers." },
    { q: "Is there a free forever plan?", a: "Yes. Our free plan is perfect for small teams and side projects, with no expiration date." }
  ]

  return (
    <SectionWrapper id="faq">
      <div className="max-w-3xl mx-auto space-y-12">
        <PageHeader title="Questions? We have answers." />
        <div className="space-y-3">
          {questions.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden transition-all">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
              >
                <span className="font-bold text-base">{item.q}</span>
                {openIndex === i ? <Minus className="size-4 text-primary" /> : <Plus className="size-4 text-muted-foreground" />}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-muted-foreground text-sm font-medium animate-in fade-in slide-in-from-top-1 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-primary text-primary-foreground text-center overflow-hidden relative transition-colors">
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 blur-[150px] pointer-events-none" />
      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">Ready to upgrade your team's pulse?</h2>
        <p className="text-lg md:text-xl font-medium opacity-90">Join 50,000+ teams who have already switched to ByteChat.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button className="h-12 px-10 rounded-md text-lg font-bold bg-background text-foreground hover:bg-background/90 shadow-xl transition-all active:scale-95">
              Get Started for Free
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="ghost" className="h-12 px-10 rounded-md text-lg font-bold text-primary-foreground hover:bg-white/10">
              Speak with Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="pt-24 pb-12 px-4 bg-background border-t border-border transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
        <div className="col-span-2 lg:col-span-1 space-y-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="size-8 bg-primary rounded-md flex items-center justify-center transition-transform group-hover:rotate-6">
              <MessageSquare className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ByteChat</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Building the next generation of team communication. Focus on what matters, let us handle the rest.
          </p>
          <div className="flex gap-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors"><RiTwitterFill className="size-5" /></Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors"><RiGithubFill className="size-5" /></Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="size-5" /></Link>
          </div>
        </div>

        <FooterColumn title="Product" links={["Features", "Integrations", "Security", "Enterprise", "Changelog"]} />
        <FooterColumn title="Company" links={["About Us", "Careers", "Blog", "Press", "Contact"]} />
        <FooterColumn title="Resources" links={["Help Center", "API Docs", "Community", "Status", "Open Source"]} />
        <FooterColumn title="Legal" links={["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"]} />
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
        <p>© 2026 ByteChat Inc. All rights reserved.</p>
        <div className="flex gap-8">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Cookies</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em]">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors font-medium">{link}</li>
        ))}
      </ul>
    </div>
  )
}
