import React from 'react';
import { 
  Sparkles, 
  Brain, 
  Workflow, 
  HardDrive, 
  Code2, 
  TrendingUp, 
  ArrowUpRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { SystemMetrics, OSPage, DeviceItem, AutomationWorkflow, MemoryNode } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardPageProps {
  metrics: SystemMetrics;
  devices: DeviceItem[];
  automations: AutomationWorkflow[];
  memories: MemoryNode[];
  onNavigate: (page: OSPage) => void;
  onOpenCommandPalette: () => void;
}

const mockActivityData = [
  { time: '00:00', load: 12, tokens: 420 },
  { time: '04:00', load: 18, tokens: 680 },
  { time: '08:00', load: 35, tokens: 1420 },
  { time: '12:00', load: 48, tokens: 2890 },
  { time: '16:00', load: 28, tokens: 1950 },
  { time: '20:00', load: 22, tokens: 1280 },
  { time: '23:59', load: 19, tokens: 850 },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  devices,
  automations,
  memories,
  onNavigate,
  onOpenCommandPalette
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & AI Daily Briefing Section */}
      <GlassCard glowColor="cyan" className="p-8 md:p-10 glass border-cyan-400/30 glow-cyan rounded-[2.5rem] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-400/40 text-cyan-400 text-xs uppercase tracking-[0.3em] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              HiMe OS Active • Gemini 3.6 Flash Engine
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Good Evening, <br />
              <span className="text-cyan-400 neon-text-cyan">Central Intelligence</span>
            </h1>

            <p className="text-white/70 text-sm leading-relaxed font-light max-w-xl">
              All 14 neural background threads are operating at nominal latency (48ms). Your 5 connected devices are synced in real time, and 8 automated workflows executed without error.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs tracking-wider uppercase hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Launch Assistant</span>
              </button>

              <button
                onClick={onOpenCommandPalette}
                className="px-6 py-3 rounded-full glass border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <span>Command Palette</span>
                <kbd className="px-2 py-0.5 text-[10px] glass rounded-full border border-white/20 font-mono text-cyan-400">⌘K</kbd>
              </button>
            </div>
          </div>

          {/* AI Readiness Score Card with Bold Number */}
          <div className="w-full lg:w-80 p-6 rounded-3xl glass border border-white/20 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] font-semibold text-white/50">
              <span>SYSTEM READINESS</span>
              <span className="text-emerald-400 font-bold tracking-normal">OPTIMAL</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-semibold tracking-tighter neon-text-cyan">98.4</span>
              <span className="text-xl text-cyan-400 font-bold">%</span>
            </div>

            <div className="w-full h-2 rounded-full glass overflow-hidden">
              <div className="h-full bg-cyan-400 glow-cyan" style={{ width: '98.4%' }} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-white/60 pt-2 border-t border-white/10">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">THREADS</span>
                <span className="text-white font-semibold">{metrics.activeThreads} Active</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">NODES</span>
                <span className="text-white font-semibold">{metrics.memoryNodesCount} Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Action Macros Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'New AI Task', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, action: () => onNavigate('ai-assistant') },
          { label: 'Add Memory Node', icon: <Brain className="w-4 h-4 text-purple-400" />, action: () => onNavigate('ai-memory') },
          { label: 'New Automation', icon: <Workflow className="w-4 h-4 text-blue-400" />, action: () => onNavigate('automation') },
          { label: 'GitHub Code Audit', icon: <Code2 className="w-4 h-4 text-emerald-400" />, action: () => onNavigate('github') },
        ].map((macro, i) => (
          <GlassCard key={i} onClick={macro.action} glowColor="cyan" className="p-4 flex items-center justify-between group rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-white/10 group-hover:scale-110 transition-transform">
                {macro.icon}
              </div>
              <span className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">{macro.label}</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
          </GlassCard>
        ))}
      </div>

      {/* Main Grid: Neural Activity Graph & Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Load & Token Graph */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Neural Analytics</h3>
                <p className="text-sm font-bold text-white">24-Hour Token & GPU Load Allocation</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('analytics')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>FULL METRICS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData}>
                <defs>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F14', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="load" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#loadGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Connected Device Overview Widget */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-emerald-500/30 text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Device Mesh</h3>
                <p className="text-sm font-bold text-white">{devices.filter(d => d.status === 'online').length} Nodes Online</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('device-control')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
            >
              MANAGE
            </button>
          </div>

          <div className="space-y-3">
            {devices.slice(0, 4).map((device) => (
              <div
                key={device.id}
                onClick={() => onNavigate('device-control')}
                className="p-3.5 rounded-2xl glass border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse glow-cyan" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{device.name.split('(')[0]}</div>
                    <div className="text-[10px] text-white/50 font-mono">{device.ipAddress}</div>
                  </div>
                </div>
                {device.batteryPct && (
                  <span className="text-xs font-mono font-bold text-emerald-400">{device.batteryPct}%</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Lower Row: AI Memory Graph Snippets & Active Automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pinned AI Memories */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-purple-500/30 text-purple-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Pinned AI Memories</h3>
                <p className="text-sm font-bold text-white">{memories.length} Stored Context Nodes</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('ai-memory')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
            >
              OPEN GRAPH
            </button>
          </div>

          <div className="space-y-3">
            {memories.slice(0, 3).map((mem) => (
              <div key={mem.id} className="p-4 rounded-2xl glass border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">{mem.title}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full glass border border-purple-400/40 text-purple-300 font-bold">{mem.category}</span>
                </div>
                <p className="text-xs text-white/70 line-clamp-2 font-light">{mem.content}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Active Automations Summary */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-blue-500/30 text-blue-400">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Automated Workflows</h3>
                <p className="text-sm font-bold text-white">8 Active Execution Nodes</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('automation')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
            >
              BUILDER
            </button>
          </div>

          <div className="space-y-3">
            {automations.map((auto) => (
              <div key={auto.id} className="p-4 rounded-2xl glass border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">{auto.title}</div>
                  <div className="text-[10px] text-white/50 font-mono">{auto.schedule} • Success: {auto.successRate}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping glow-cyan" />
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">ENABLED</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
