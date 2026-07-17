import { useState } from "react"
import { Thermometer, Lock, Unlock, Lightbulb, Video, Plus, Minus, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import GlassCard from "@/components/glass-card"
import { Button } from "@/components/ui/button"

interface Device {
  id: string
  name: string
  status: string
  value?: string | number
  unit?: string
  icon: React.ComponentType<any>
  type: "climate" | "security" | "lighting" | "vision"
}

export default function DeviceOverview() {
  const [temp, setTemp] = useState(71)
  const [isLocked, setIsLocked] = useState(true)
  const [lightsActive, setLightsActive] = useState(4)

  const devices: Device[] = [
    {
      id: "thermostat",
      name: "Smart Thermostat",
      status: "Heating to target",
      value: temp,
      unit: "°F",
      icon: Thermometer,
      type: "climate"
    },
    {
      id: "doors",
      name: "Smart Entrance Lock",
      status: isLocked ? "Locked & Armed" : "Unlocked",
      icon: isLocked ? Lock : Unlock,
      type: "security"
    },
    {
      id: "lighting",
      name: "Main Lighting",
      status: `${lightsActive} zones active`,
      value: lightsActive ? `${Math.round((lightsActive / 8) * 100)}%` : "Off",
      icon: Lightbulb,
      type: "lighting"
    },
    {
      id: "vision",
      name: "Vision Stream Matrix",
      status: "4 feeds online",
      value: "REC",
      icon: Video,
      type: "vision"
    }
  ]

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Device Telemetry</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map((device) => {
          const Icon = device.icon

          return (
            <GlassCard
              key={device.id}
              className="flex flex-col justify-between h-40 border border-zinc-800/40 relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg bg-zinc-900 shadow-inner text-zinc-400 border border-zinc-800/50",
                    device.type === "climate" && "text-orange-400",
                    device.type === "security" && isLocked && "text-emerald-400",
                    device.type === "security" && !isLocked && "text-amber-400",
                    device.type === "lighting" && lightsActive > 0 && "text-yellow-400",
                    device.type === "vision" && "text-blue-400"
                  )}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">{device.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">{device.status}</p>
                  </div>
                </div>

                {/* Arrow to feature section */}
                {device.type === "vision" && (
                  <Link
                    to="/camera-vision"
                    className="p-1.5 rounded-md hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Central Value */}
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-semibold tracking-tight text-white font-mono">
                  {device.value !== undefined ? device.value : ""}
                </span>
                {device.unit && (
                  <span className="text-sm text-zinc-500 font-semibold">{device.unit}</span>
                )}
              </div>

              {/* Dynamic Bottom Controls */}
              <div className="pt-2 border-t border-zinc-800/20">
                {device.type === "climate" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Target Temp</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTemp(temp - 1)}
                        className="h-6 w-6 text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/30"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTemp(temp + 1)}
                        className="h-6 w-6 text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/30"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {device.type === "security" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Access Lock</span>
                    <Button
                      variant="ghost"
                      onClick={() => setIsLocked(!isLocked)}
                      className={cn(
                        "h-6 px-3 text-xs font-semibold rounded border transition-colors",
                        isLocked
                          ? "border-emerald-800/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-850"
                      )}
                    >
                      {isLocked ? "Unlock Door" : "Lock Door"}
                    </Button>
                  </div>
                )}

                {device.type === "lighting" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Active Zones</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={lightsActive === 0}
                        onClick={() => setLightsActive(lightsActive - 1)}
                        className="h-6 w-6 text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/30 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={lightsActive === 8}
                        onClick={() => setLightsActive(lightsActive + 1)}
                        className="h-6 w-6 text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/30 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {device.type === "vision" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium text-left">Detection Matrix</span>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-blue-500/10 border border-blue-500/25 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      Object AI Active
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
