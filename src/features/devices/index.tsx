import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Thermometer,
  Lock,
  Unlock,
  Lightbulb,
  Video,
  Power,
  Tv,
  Battery,
  Search,
  ChevronRight,
  Wifi,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface IoTDevice {
  id: string
  name: string
  room: string
  type: "climate" | "security" | "lighting" | "entertainment" | "power"
  status: "online" | "offline"
  stateSummary: string
  value?: string | number
  battery?: number
  icon: React.ComponentType<any>
}

export const initialDevices: IoTDevice[] = [
  { id: "living-hvac", name: "Living Room Thermostat", room: "Living Room", type: "climate", status: "online", stateSummary: "Heating", value: "72°F", icon: Thermometer },
  { id: "front-lock", name: "Front Entrance Lock", room: "Foyer", type: "security", status: "online", stateSummary: "Locked & Armed", battery: 84, icon: Lock },
  { id: "hall-lights", name: "Main Hallway Lights", room: "Hallway", type: "lighting", status: "online", stateSummary: "On", value: "60% Dim", icon: Lightbulb },
  { id: "front-gate-cam", name: "Front Gate Cam", room: "Driveway", type: "security", status: "online", stateSummary: "Recording", value: "AI Active", icon: Video },
  { id: "den-tv", name: "Den Media Center", room: "Den", type: "entertainment", status: "online", stateSummary: "Standby", value: "Off", icon: Tv },
  { id: "kitchen-plug", name: "Espresso Maker Outlet", room: "Kitchen", type: "power", status: "online", stateSummary: "Preheating", value: "850W", icon: Power },
  { id: "back-gate-cam", name: "Backyard Security Cam", room: "Backyard", type: "security", status: "online", stateSummary: "Standby", value: "Online", icon: Video },
  { id: "bedroom-hvac", name: "Bedroom Thermostat", room: "Master Bedroom", type: "climate", status: "online", stateSummary: "Cooling", value: "68°F", icon: Thermometer },
  { id: "garage-door", name: "Garage Overhead Door", room: "Garage", type: "security", status: "offline", stateSummary: "No Connection", icon: Unlock }
]

const filterTabs = [
  { id: "all", label: "All Nodes" },
  { id: "climate", label: "Climate" },
  { id: "security", label: "Security" },
  { id: "lighting", label: "Lighting" },
  { id: "entertainment", label: "Media" },
  { id: "power", label: "Plugs" }
]

export default function DevicesPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDevices = initialDevices.filter((dev) => {
    const matchesFilter = filter === "all" || dev.type === filter
    const matchesSearch = dev.name.toLowerCase().includes(searchQuery.toLowerCase()) || dev.room.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6 select-none">
      {/* Header and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">IoT Connected Nodes</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage system configurations and parameters for smart devices.</p>
        </div>

        {/* Search everything */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device name or room..."
            className="w-full h-9 pl-9 bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-800 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-850">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 border border-transparent ${
              filter === tab.id
                ? "bg-zinc-900/90 text-white border-zinc-800/50 shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Devices Grid List */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredDevices.map((device) => {
            const Icon = device.icon
            const isOffline = device.status === "offline"

            return (
              <motion.div
                key={device.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className={`flex flex-col justify-between h-44 border p-5 relative overflow-hidden transition-all duration-300 ${
                  isOffline ? "border-red-950/20 bg-red-950/5 opacity-60" : "border-zinc-800/40 hover:border-zinc-800"
                }`}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/50 shrink-0 text-zinc-400 ${
                        !isOffline && device.type === "climate" && "text-orange-400",
                        !isOffline && device.type === "security" && "text-emerald-400",
                        !isOffline && device.type === "lighting" && "text-yellow-400",
                        !isOffline && device.type === "power" && "text-pink-400",
                        !isOffline && device.type === "entertainment" && "text-blue-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <h3 className="font-semibold text-sm text-zinc-200 truncate">{device.name}</h3>
                        <span className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider uppercase block mt-0.5">{device.room}</span>
                      </div>
                    </div>

                    {/* Dropdown Menu actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300 w-40 mt-1">
                        <DropdownMenuItem
                          render={<Link to={`/devices/${device.id}`}>Device Details</Link>}
                          className="focus:bg-zinc-800 focus:text-zinc-100 text-xs"
                        />
                        {!isOffline && (
                          <DropdownMenuItem
                            render={<Link to={`/devices/${device.id}/control`}>Device Control</Link>}
                            className="focus:bg-zinc-800 focus:text-zinc-100 text-xs"
                          />
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Node telemetries */}
                  <div className="flex items-baseline justify-between my-2">
                    <span className="text-2xl font-bold tracking-tight text-white font-mono">
                      {device.value !== undefined ? device.value : device.stateSummary}
                    </span>
                    
                    {/* Battery status */}
                    {device.battery !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold">
                        <Battery className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{device.battery}%</span>
                      </div>
                    )}
                  </div>

                  {/* Actions bottom link row */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/20 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Wifi className={`w-3.5 h-3.5 ${isOffline ? 'text-rose-500' : 'text-emerald-400'}`} />
                      <span className={isOffline ? 'text-rose-500' : 'text-zinc-400'}>
                        {isOffline ? 'Offline' : 'Sync Active'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/devices/${device.id}`}
                        className="text-zinc-500 hover:text-zinc-300 font-medium px-2 py-1 hover:bg-zinc-900/40 rounded transition-all"
                      >
                        Detail
                      </Link>
                      {!isOffline && (
                        <Link
                          to={`/devices/${device.id}/control`}
                          className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 px-2 py-1 rounded transition-all flex items-center gap-0.5"
                        >
                          Control
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
