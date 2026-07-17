import { useState } from "react"
import { Link, useParams, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Power,
  Sun,
  Lock,
  Unlock,
  Key,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import GlassCard from "@/components/glass-card"
import { initialDevices } from "./index"

export default function DeviceControlPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const device = initialDevices.find((d) => d.id === deviceId)

  // Redirect to list if device ID is invalid or device is offline
  if (!device || device.status === "offline") {
    return <Navigate to="/devices" replace />
  }

  const Icon = device.icon

  // Control states based on device type
  const [isOn, setIsOn] = useState(true)
  const [brightness, setBrightness] = useState(60)
  const [temp, setTemp] = useState(72)
  const [fanMode, setFanMode] = useState("Auto")
  const [isLocked, setIsLocked] = useState(true)
  const [pinCode, setPinCode] = useState("")

  const generatePin = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setPinCode(code)
  }

  return (
    <div className="space-y-6 select-none text-left max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/devices/${device.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </Link>
      </div>

      {/* Header title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/60 text-indigo-400">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-200">Control Core</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{device.name}</p>
        </div>
      </div>

      {/* Device-Specific Controller Panels */}
      <div className="space-y-6">
        
        {/* CLIMATE CONTROLLERS (Thermostats) */}
        {device.type === "climate" && (
          <GlassCard className="p-6 border border-zinc-800/40 space-y-6 text-center">
            {/* Target Dial Visualizer */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/40">
              <div className="absolute inset-2 rounded-full border border-dashed border-zinc-800" />
              <div className="text-center space-y-1">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider font-mono">Target</span>
                <div className="text-4xl font-bold font-mono tracking-tight text-white">{temp}°F</div>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded font-mono">Heat Pump Active</span>
              </div>
            </div>

            {/* Target Dial Incrementor buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setTemp(temp - 1)}
                className="h-10 w-20 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-lg font-bold"
              >
                -
              </Button>
              <Button
                onClick={() => setTemp(temp + 1)}
                className="h-10 w-20 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-lg font-bold"
              >
                +
              </Button>
            </div>

            {/* Fan and mode controls */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/20">
              {["Auto", "On", "Circulate"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFanMode(mode)}
                  className={`text-xs py-2 rounded-lg font-semibold border transition-all ${
                    fanMode === mode
                      ? "bg-zinc-900 border-zinc-800 text-white shadow-inner"
                      : "text-zinc-400 border-transparent hover:bg-zinc-900/30"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </GlassCard>
        )}

        {/* LIGHTING CONTROLLERS (Dimmer switches) */}
        {device.type === "lighting" && (
          <GlassCard className="p-6 border border-zinc-800/40 space-y-6">
            {/* Power Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-zinc-200">Main Power</h3>
                <p className="text-xs text-zinc-500 font-medium">{isOn ? "Light source active" : "Source shutdown"}</p>
              </div>
              
              <Button
                onClick={() => setIsOn(!isOn)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                  isOn
                    ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                }`}
              >
                <Power className="w-4 h-4" />
              </Button>
            </div>

            {/* Brightness Dimmer Slider */}
            {isOn && (
              <div className="space-y-3 pt-4 border-t border-zinc-800/20">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    Dimmer Scale
                  </span>
                  <span className="font-mono font-semibold">{brightness}%</span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
              </div>
            )}

            {/* Quick Presets Row */}
            {isOn && (
              <div className="grid grid-cols-4 gap-2 pt-4">
                {[10, 30, 70, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBrightness(val)}
                    className="text-xs py-1.5 rounded border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 transition-all font-mono"
                  >
                    {val}%
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* SECURITY CONTROLLERS (Locks) */}
        {device.type === "security" && (
          <div className="space-y-6">
            <GlassCard className="p-6 border border-zinc-800/40 text-center space-y-6">
              {/* Animated Padlock visualizer */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-2xl bg-zinc-950/40 border border-zinc-800">
                <motion.div
                  animate={{ scale: isLocked ? 1 : 1.05 }}
                  className={`p-5 rounded-full ${isLocked ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                >
                  {isLocked ? <Lock className="w-10 h-10" /> : <Unlock className="w-10 h-10" />}
                </motion.div>
              </div>

              {/* Toggle secure lock state */}
              <Button
                onClick={() => setIsLocked(!isLocked)}
                className={`w-full h-11 rounded-lg font-semibold transition-all text-sm ${
                  isLocked
                    ? "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/10"
                }`}
              >
                {isLocked ? "Unlock Security Node" : "Engage Security Lock"}
              </Button>
            </GlassCard>

            {/* Access pin codes generator card */}
            <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Temporary Access Keys
              </h3>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={generatePin}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 h-9 rounded-lg"
                >
                  Generate Guest PIN
                </Button>

                {pinCode && (
                  <div className="flex-1 h-9 rounded-lg border border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-3 text-xs font-mono font-bold text-zinc-300">
                    <span>{pinCode}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires 30m
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* POWER CONTROLLERS (Smart Plugs) */}
        {device.type === "power" && (
          <GlassCard className="p-6 border border-zinc-800/40 space-y-6">
            {/* Power Toggle switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-zinc-200">Relay Power Switch</h3>
                <p className="text-xs text-zinc-500 font-medium">{isOn ? "Relay closed - power output active" : "Relay open - output disabled"}</p>
              </div>

              <Button
                onClick={() => setIsOn(!isOn)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                  isOn
                    ? "bg-pink-500/20 border border-pink-500/40 text-pink-400 hover:bg-pink-500/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                }`}
              >
                <Power className="w-4 h-4" />
              </Button>
            </div>

            {/* Timer countdown controls */}
            {isOn && (
              <div className="space-y-4 pt-4 border-t border-zinc-800/20">
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Auto Shutoff Timer
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {["15 Mins", "30 Mins", "1 Hour"].map((timeVal) => (
                    <button
                      key={timeVal}
                      className="text-xs py-2 rounded-lg border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 transition-all font-semibold"
                    >
                      {timeVal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        )}

      </div>
    </div>
  )
}
