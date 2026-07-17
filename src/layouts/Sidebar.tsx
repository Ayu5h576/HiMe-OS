import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { useOS } from "@/contexts/OSContext"
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  GitFork,
  Brain,
  BarChart3,
  Eye,
  Volume2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  className?: string
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Assistant", icon: MessageSquare },
  { path: "/devices", label: "IoT Devices", icon: Cpu },
  { path: "/automation", label: "Automations", icon: GitFork },
  { path: "/ai-memory", label: "AI Memory", icon: Brain },
  { path: "/camera-vision", label: "Camera Vision", icon: Eye },
  { path: "/audio", label: "Audio Manager", icon: Volume2 },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ isOpen, setIsOpen, className }: SidebarProps) {
  const { activeWorkspace } = useOS()

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 300 : 80 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex flex-col h-full bg-zinc-950/70 backdrop-blur-xl border-r border-zinc-800/60 z-20 overflow-hidden",
        className
      )}
    >
      {/* Workspace Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/10">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col text-left"
            >
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">OS Profile</span>
              <span className="text-sm text-zinc-200 font-medium truncate w-[140px]">{activeWorkspace}</span>
            </motion.div>
          )}
        </div>

        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200",
                  isActive
                    ? "bg-zinc-900/90 text-white border border-zinc-800/50 shadow-inner"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border border-transparent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "flex items-center justify-center shrink-0 w-6 h-6 rounded-md transition-colors",
                      isActive
                        ? "text-blue-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar Footer Stats */}
      <div className="p-4 border-t border-zinc-800/40 bg-zinc-950/40">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col text-left text-xs"
              >
                <span className="text-zinc-400 font-medium">Core Load</span>
                <span className="text-zinc-500">14% - Normal</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-md bg-blue-500/10 text-blue-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col text-left text-xs"
              >
                <span className="text-zinc-400 font-medium">Secure Link</span>
                <span className="text-zinc-500">SSL Enabled</span>
              </motion.div>
            )}
          </div>
        </div>

        {!isOpen && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              onClick={() => setIsOpen(true)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
