import { createContext, useContext, useState, type ReactNode } from "react"

interface OSContextType {
  isAICoreOnline: boolean
  setIsAICoreOnline: (online: boolean) => void
  connectedNodesCount: number
  setConnectedNodesCount: (count: number) => void
  activeWorkspace: string
  setActiveWorkspace: (workspace: string) => void
  spotlightOpen: boolean
  setSpotlightOpen: (open: boolean) => void
}

const OSContext = createContext<OSContextType | undefined>(undefined)

export function OSProvider({ children }: { children: ReactNode }) {
  const [isAICoreOnline, setIsAICoreOnline] = useState(true)
  const [connectedNodesCount, setConnectedNodesCount] = useState(12)
  const [activeWorkspace, setActiveWorkspace] = useState("HiMe Mainframe")
  const [spotlightOpen, setSpotlightOpen] = useState(false)

  return (
    <OSContext.Provider
      value={{
        isAICoreOnline,
        setIsAICoreOnline,
        connectedNodesCount,
        setConnectedNodesCount,
        activeWorkspace,
        setActiveWorkspace,
        spotlightOpen,
        setSpotlightOpen,
      }}
    >
      {children}
    </OSContext.Provider>
  )
}

export function useOS() {
  const context = useContext(OSContext)
  if (context === undefined) {
    throw new Error("useOS must be used within an OSProvider")
  }
  return context
}
