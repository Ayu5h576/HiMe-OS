import React, { useState } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Zap, 
  Database, 
  Activity, 
  TrendingUp, 
  Clock, 
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { SystemMetrics } from '../../types';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

interface AnalyticsPageProps {
  metrics: SystemMetrics;
}

const mockTokenTrends = [
  { day: 'Mon', tokens: 12400, latency: 52 },
  { day: 'Tue', tokens: 18900, latency: 49 },
  { day: 'Wed', tokens: 24500, latency: 45 },
  { day: 'Thu', tokens: 31200, latency: 48 },
  { day: 'Fri', tokens: 28400, latency: 44 },
  { day: 'Sat', tokens: 19800, latency: 46 },
  { day: 'Sun', tokens: 22100, latency: 42 },
];

const mockMemoryAllocation = [
  { name: 'Gemini Context', value: 45 },
  { name: 'Memory Graph', value: 25 },
  { name: 'Device RPC', value: 15 },
  { name: 'OS Shell Runtime', value: 15 },
];

const COLORS = ['#06b6d4', '#a855f7', '#10b981', '#3b82f6'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ metrics }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <GlassCard className="p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-amber-400/30 text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                System Intelligence & Analytics
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  Real-time Telemetry
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Gemini token throughput, memory allocation, and hardware telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-full glass hover:bg-white/15 border border-white/20 text-xs font-mono font-bold text-white flex items-center gap-2 transition-all uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Token Throughput', val: '157,300', unit: 'Tokens / Day', icon: <Zap className="w-4 h-4 text-cyan-400" /> },
          { label: 'Avg Neural Latency', val: `${metrics.neuralLatencyMs}ms`, unit: 'Nominal Response', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
          { label: 'RAM Memory Usage', val: `${metrics.ramUsageGB} GB`, unit: `/ ${metrics.ramTotalGB} GB Total`, icon: <Cpu className="w-4 h-4 text-purple-400" /> },
          { label: 'System Energy Score', val: '96.2%', unit: 'Eco Efficiency', icon: <Activity className="w-4 h-4 text-amber-400" /> },
        ].map((m, i) => (
          <GlassCard key={i} className="p-5 space-y-2 rounded-3xl">
            <div className="flex items-center justify-between text-xs font-mono text-white/50 font-bold uppercase tracking-wider">
              <span>{m.label}</span>
              <div className="p-2 rounded-2xl glass border border-white/10">{m.icon}</div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{m.val}</div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{m.unit}</div>
          </GlassCard>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Usage & Latency Line Chart */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white">Gemini Token Throughput vs Latency</h3>
            </div>
            <span className="text-xs font-mono text-white/50 font-bold">7-Day Trend</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTokenTrends}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#334155', borderRadius: '16px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="tokens" fill="#00F0FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Memory Allocation Pie Chart */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white">Memory Allocation</h3>
            </div>
            <span className="text-xs font-mono text-purple-400 font-bold">32 GB Pool</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockMemoryAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockMemoryAllocation.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#334155', borderRadius: '16px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 text-xs font-mono">
            {mockMemoryAllocation.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-white/80">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  {item.name}
                </span>
                <span className="font-extrabold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
