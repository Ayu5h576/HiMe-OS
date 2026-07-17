import { Link, useParams, Navigate } from "react-router-dom"
import {
  ArrowLeft,
  Sliders,
  Activity,
  History,
  Info,
  TrendingUp,
  Battery
} from "lucide-react"
import GlassCard from "@/components/glass-card"
import { initialDevices } from "./index"

export default function DeviceDetailsPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const device = initialDevices.find((d) => d.id === deviceId)

  // Redirect to list if device ID is invalid
  if (!device) {
    return <Navigate to="/devices" replace />
  }

  const isOffline = device.status === "offline"
  const Icon = device.icon

  // Simulated activity/telemetry history logs
  const historyLogs = [
    { id: "h-1", action: "State updated to target value", operator: "AI Core Manager", time: "12:45 PM" },
    { id: "h-2", action: "Active parameters synchronized", operator: "System Daemon", time: "10:14 AM" },
    { id: "h-3", action: "Diagnostic telemetry run completed", operator: "HiMe Kernel", time: "8:00 AM" },
    { id: "h-4", action: "Secure handshake established", operator: "Gatekeeper Node", time: "1:15 AM" }
  ]

  // Mock SVG chart for device power/uptime history
  const renderSVGChart = () => (
    <svg className="w-full h-32 text-indigo-500" viewBox="0 0 400 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      <path
        d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 L400,100 L0,100 Z"
        fill="url(#gradient)"
      />
      <path
        d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
      />
      {/* Target reference dashed line */}
      <line x1="0" y1="50" x2="400" y2="50" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  )

  return (
    <div className="space-y-6 select-none text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/devices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Nodes
        </Link>
      </div>

      {/* Main Grid: Details Header + Telemetries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Device profile */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard className="p-6 border border-zinc-800/40 space-y-5 text-center">
            {/* Device Icon bubble */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400">
              <Icon className="w-8 h-8 text-indigo-400" />
            </div>

            {/* Profile info */}
            <div>
              <h2 className="text-xl font-semibold text-zinc-200">{device.name}</h2>
              <span className="text-xs text-zinc-500 font-mono mt-0.5 block">{device.room}</span>
            </div>

            {/* Battery state */}
            {device.battery !== undefined && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/30 border border-zinc-850 px-3 py-1.5 rounded-lg">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery Level: {device.battery}%</span>
              </div>
            )}

            {/* Actions button */}
            {!isOffline && (
              <Link
                to={`/devices/${device.id}/control`}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all text-sm"
              >
                <Sliders className="w-4 h-4" />
                Control Node
              </Link>
            )}
          </GlassCard>

          {/* Network specs info card */}
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Node Info
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Node ID</span>
                <span className="text-zinc-300">{device.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Hardware Node</span>
                <span className="text-zinc-300">ESP32-S3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Firmware</span>
                <span className="text-zinc-300">v2.1.8-core</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Encryption</span>
                <span className="text-zinc-300">TLS 1.3 AES-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">IP Endpoint</span>
                <span className="text-zinc-300">{isOffline ? "N/A" : "192.168.1.14"}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Charts & Logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Telemetry charts */}
          <GlassCard className="p-6 border border-zinc-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                Telemetry Stats
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uptime: 99.8%</span>
              </div>
            </div>
            
            {/* Draw chart */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 overflow-hidden">
              {renderSVGChart()}
            </div>
            
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-mono">
              <span>08:00 AM</span>
              <span>10:00 AM</span>
              <span>12:00 PM</span>
            </div>
          </GlassCard>

          {/* Action Log History */}
          <GlassCard className="p-6 border border-zinc-800/40 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <History className="w-4 h-4 text-zinc-400" />
              Event Log History
            </h3>
            
            <div className="space-y-3.5">
              {historyLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between text-xs border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-300">{log.action}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">Operator: {log.operator}</span>
                  </div>
                  <span className="font-mono text-zinc-500 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
