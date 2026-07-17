import { Activity, ShieldCheck, Sun, CheckCircle } from "lucide-react"
import GlassCard from "@/components/glass-card"

export default function SystemSummary() {
  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Today's Summary</h3>
      </div>

      <GlassCard className="p-5 border border-zinc-800/40 text-left space-y-4">
        {/* Short paragraph summarizing environment */}
        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
          HiMe OS security matrices are active. The home environment was quiet. Energy consumption is down <span className="text-emerald-400 font-semibold font-mono">11%</span> compared to last week due to smart thermostat scheduling.
        </p>

        {/* Small stats sub grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Security</div>
              <div className="text-xs text-zinc-300 font-semibold">Armed - Safe</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Solar Gen</div>
              <div className="text-xs text-zinc-300 font-semibold">4.8 kWh</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Processor</div>
              <div className="text-xs text-zinc-300 font-semibold">14% Load</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-medium font-mono uppercase">Health</div>
              <div className="text-xs text-zinc-300 font-semibold">0 Faults</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
