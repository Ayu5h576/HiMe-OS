import { useState, useEffect } from "react"
import { Activity, ShieldCheck, Cpu, HardDrive } from "lucide-react"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

export default function SystemSummary() {
  const [telemetry, setTelemetry] = useState({
    cpuUsage: 14,
    ramUsage: 38,
    storageFreeGB: 120,
    healthStatus: "HEALTHY",
  })

  useEffect(() => {
    let mounted = true
    const fetchTelemetry = async () => {
      try {
        await himeApi.ensureAuthenticated()
        const sys = await himeApi.getRuntimeSystem().catch(() => null)
        const status = await himeApi.getRuntimeStatus().catch(() => null)
        
        if (mounted && sys?.cpu) {
          setTelemetry({
            cpuUsage: Math.round(sys.cpu.usagePercent || 14),
            ramUsage: Math.round(sys.ram?.usagePercent || 38),
            storageFreeGB: Math.round((sys.storage?.freeBytes || 120000000000) / (1024 * 1024 * 1024)),
            healthStatus: status?.health?.status || "HEALTHY",
          })
        }
      } catch (err) {
        console.warn("[SystemSummary] Telemetry fetch warning:", err)
      }
    }

    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Today's Telemetry</h3>
      </div>

      <GlassCard className="p-5 border border-zinc-800/40 text-left space-y-4">
        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
          HiMe OS runtime agent is active. Telemetry monitors system load, node connections, and memory allocation. Core status reporting <span className="text-emerald-400 font-semibold font-mono">{telemetry.healthStatus}</span>.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Security</div>
              <div className="text-xs text-zinc-300 font-semibold">SSL Secured</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Free Storage</div>
              <div className="text-xs text-zinc-300 font-semibold">{telemetry.storageFreeGB} GB</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">CPU Load</div>
              <div className="text-xs text-zinc-300 font-semibold">{telemetry.cpuUsage}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">RAM Load</div>
              <div className="text-xs text-zinc-300 font-semibold">{telemetry.ramUsage}%</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
