import { useState } from "react"
import { motion } from "framer-motion"
import { Home, LogOut, ShieldCheck, Film, Play, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import GlassCard from "@/components/glass-card"

interface Routine {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
}

const initialRoutines: Routine[] = [
  {
    id: "arrive",
    name: "Arrive Home",
    description: "Unlocks doors, sets thermostat, enables lighting",
    icon: Home,
    color: "from-blue-500/20 to-cyan-500/20 text-blue-400"
  },
  {
    id: "away",
    name: "Away Mode",
    description: "Locks all nodes, arms security, dims thermostats",
    icon: LogOut,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400"
  },
  {
    id: "secure",
    name: "Secure System",
    description: "Arms perimeter guard, triggers motion cameras",
    icon: ShieldCheck,
    color: "from-rose-500/20 to-red-500/20 text-rose-400"
  },
  {
    id: "movie",
    name: "Movie Night",
    description: "Dims theater lights, boots display, mute speaker alerts",
    icon: Film,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400"
  }
]

export default function QuickActions() {
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  const handleTrigger = (id: string) => {
    setRunningId(id)
    setTimeout(() => {
      setActiveRoutine(id)
      setRunningId(null)
    }, 1200)
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Routine Presets</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialRoutines.map((routine) => {
          const Icon = routine.icon
          const isActive = activeRoutine === routine.id
          const isRunning = runningId === routine.id

          return (
            <GlassCard
              key={routine.id}
              onClick={() => !isRunning && handleTrigger(routine.id)}
              className={cn(
                "relative group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between h-32 text-left border",
                isActive
                  ? "border-zinc-700 bg-zinc-900/50"
                  : "border-zinc-800/40 hover:border-zinc-800"
              )}
            >
              {/* Routine header info */}
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg bg-gradient-to-br shadow-inner", routine.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Trigger button or active indicator */}
                <div className="h-6 w-6 rounded-full flex items-center justify-center border border-zinc-800/60 bg-zinc-950/40">
                  {isRunning ? (
                    <span className="w-3.5 h-3.5 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                  ) : isActive ? (
                    <Check className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Play className="w-2.5 h-2.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>

              {/* Text label */}
              <div>
                <h4 className="font-semibold text-sm text-zinc-200">{routine.name}</h4>
                <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{routine.description}</p>
              </div>

              {/* Active Bottom Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
