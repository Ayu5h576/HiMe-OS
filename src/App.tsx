import { RouterProvider } from "react-router-dom"
import { router } from "@/app/routes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { OSProvider } from "@/contexts/OSContext"

function App() {
  return (
    <OSProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </OSProvider>
  )
}

export default App
