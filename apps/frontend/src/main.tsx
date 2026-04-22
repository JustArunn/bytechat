import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store/index.ts"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "./components/ui/tooltip.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
