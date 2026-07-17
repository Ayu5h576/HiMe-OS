import { useState } from "react"
import { BarChart3, Cpu, Download, ArrowUpRight, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import GlassCard from "@/components/glass-card"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7 Days")

  // Mock SVG Power consumption bars
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

  // Mock SVG Token utilization filled line graph
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
      {/* Header and range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Telemetry Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">Review solar generation, node energy stats, and AI core resource utilization.</p>
        </div>

        {/* Time ranges */}
        <div className="flex gap-1.5 border border-zinc-800/80 rounded-lg p-0.5 bg-zinc-950/40">
          {["24 Hours", "7 Days", "30 Days"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`text-xs px-3 py-1.5 rounded font-semibold transition-all ${
                timeRange === range
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats overview cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider block">Energy Saved</span>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">14.8 kWh</div>
          <div className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Down 11% vs last week
          </div>
        </GlassCard>
        
        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider block">Total AI Prompts</span>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">1,248</div>
          <div className="text-[10px] text-zinc-400 font-semibold font-mono">Average 178 / day</div>
        </GlassCard>

        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider block">Local Node Latency</span>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">12.4 ms</div>
          <div className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-0.5">
            <CheckCircleIcon />
            Optimal sync
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-zinc-800/40 space-y-2">
          <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider block">AI Token Usage</span>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">428k</div>
          <div className="text-[10px] text-indigo-400 font-semibold font-mono flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            98.5% cache hit
          </div>
        </GlassCard>
      </div>

      {/* Telemetry charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Power Chart */}
        <GlassCard className="p-6 border border-zinc-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Power Telemetry (kWh)
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 overflow-hidden">
            {renderPowerChart()}
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono uppercase font-semibold">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </GlassCard>

        {/* Token Chart */}
        <GlassCard className="p-6 border border-zinc-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              AI Core Token Volatility
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 overflow-hidden">
            {renderTokenChart()}
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono uppercase font-semibold">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </GlassCard>

      </div>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
