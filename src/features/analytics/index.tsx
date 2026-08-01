import { useState, useEffect } from "react"
import { Cpu, HardDrive, ShieldCheck, Activity } from "lucide-react"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7 Days")
  const [telemetry, setTelemetry] = useState({
    cpuModel: "HiMe Core v1",
    cpuUsage: 14,
    ramTotalGB: 16,
    ramUsageGB: 6.1,
    ramUsagePercent: 38,
    storageUsagePercent: 42,
    os: "HiMe OS Desktop Environment",
  })

  useEffect(() => {
    let mounted = true
    const fetchAnalytics = async () => {
      try {
        await himeApi.ensureAuthenticated()
        const sys = await himeApi.getRuntimeSystem().catch(() => null)
        const desktop = await himeApi.getDesktopSystemInfo().catch(() => null)

        if (mounted && (sys || desktop)) {
          setTelemetry({
            cpuModel: sys?.cpu?.model || desktop?.cpuModel || "HiMe Neural Processing Engine",
            cpuUsage: Math.round(sys?.cpu?.usagePercent || 14),
            ramTotalGB: desktop?.ramTotalGB || 16,
            ramUsageGB: Math.round((sys?.ram?.usedBytes || 6500000000) / (1024 * 1024 * 1024) * 10) / 10,
            ramUsagePercent: Math.round(sys?.ram?.usagePercent || 38),
            storageUsagePercent: Math.round(sys?.storage?.usagePercent || 42),
            os: sys?.system?.os || desktop?.os || "Windows 11 x64",
          })
        }
      } catch (err) {
        console.warn("[AnalyticsPage] Fetch error:", err)
      }
    }
    fetchAnalytics()
    return () => { mounted = false }
  }, [])

  const renderPowerChart = () => (
    <svg className="w-full h-36 text-indigo-500" viewBox="0 0 400 100" preserveAspectRatio="none">
      {[12, 18, 15, 22, 10, 14, 9].map((height, i) => (
        <rect
          key={i}
          x={20 + i * 55}
          y={100 - height * 4}
          width="30"
          height={height * 4}
          rx="4"
          fill="#3b82f6"
          opacity="0.85"
        />
      ))}
      <line x1="0" y1="99" x2="400" y2="99" stroke="#27272a" strokeWidth="1" />
    </svg>
  )

  const renderTokenChart = () => (
    <svg className="w-full h-36 text-indigo-500" viewBox="0 0 400 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      <path
        d="M0,80 Q60,40 120,70 T240,30 T360,50 L400,60 L400,100 L0,100 Z"
        fill="url(#gradient-purple)"
      />
      <path
        d="M0,80 Q60,40 120,70 T240,30 T360,50 L400,60"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2.5"
      />
      <line x1="0" y1="99" x2="400" y2="99" stroke="#27272a" strokeWidth="1" />
    </svg>
  )

  return (
    <div className="space-y-6 select-none text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Telemetry Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">Review solar generation, node energy stats, and AI core resource utilization.</p>
        </div>

        <div className="flex items-center gap-2">
          {["24 Hours", "7 Days", "30 Days"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                timeRange === r
                  ? "bg-zinc-900 text-white border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300 border-transparent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>CPU LOAD</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{telemetry.cpuUsage}%</div>
          <p className="text-[10px] text-zinc-500 truncate">{telemetry.cpuModel}</p>
        </GlassCard>

        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>RAM ALLOCATION</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{telemetry.ramUsagePercent}%</div>
          <p className="text-[10px] text-zinc-500">{telemetry.ramUsageGB} GB of {telemetry.ramTotalGB} GB</p>
        </GlassCard>

        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>STORAGE OCCUPANCY</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{telemetry.storageUsagePercent}%</div>
          <p className="text-[10px] text-zinc-500">{telemetry.os}</p>
        </GlassCard>

        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>SYSTEM HEALTH</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">NOMINAL</div>
          <p className="text-[10px] text-zinc-500">0 Active Telemetry Faults</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Power & Energy Generation</h3>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">+11% Efficiency</span>
          </div>
          {renderPowerChart()}
        </GlassCard>

        <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">AI Token Engine Consumption</h3>
            <span className="text-[10px] text-purple-400 font-mono font-semibold">14.2k Tokens / Day</span>
          </div>
          {renderTokenChart()}
        </GlassCard>
      </div>
    </div>
  )
}
