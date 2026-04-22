import { RiMoonLine, RiSunLine, RiComputerLine } from "@remixicon/react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative flex items-center justify-center"
    >
      <RiSunLine
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        }`}
      />
      <RiMoonLine
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        }`}
      />
      <RiComputerLine
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          theme === "system" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme (currently {theme})</span>
    </Button>
  )
}



