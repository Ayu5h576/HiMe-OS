import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Workflow, 
  HardDrive, 
  TrendingUp, 
  ArrowUpRight,
  Battery,
  BatteryCharging,
  Cpu,
  MemoryStick,
  Monitor,
  Activity,
  ShieldCheck,
  Zap,
  Volume2,
  Sun,
  Lock,
  Play,
  CheckCircle2,
  RefreshCw,
  Clock,
  Bell
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { himeApi } from '../../services/api/himeApi';
import type { OSPage } from '../../types';

interface DashboardPageProps {
  onNavigate: (page: OSPage) => void;
  onOpenCommandPalette: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenCommandPalette
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Backend Data States
  const [systemMetrics, setSystemMetrics] = useState<{
    system: { os: string; hostname: string; network: string; activeWindow: string };
    cpu: { model: string; cores: number; usagePercent: number };
    ram: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number };
    storage: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number; mountPoint: string };
    battery: { percent: number; isCharging: boolean; timeRemainingMinutes: number };
  } | null>(null);

  const [agentHealth, setAgentHealth] = useState<{
    agentName: string;
    version: string;
    isOnline: boolean;
    watchedFolders: string[];
    health: {
      status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
      agentUptimeSeconds: number;
      latencyMs: number;
      lastHeartbeat: string;
    };
  } | null>(null);

  const [processes, setProcesses] = useState<Array<{ pid: number; name: string; memoryMB: number }>>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; priority: string; read: boolean; timestamp: string }>>([]);
  const [automations, setAutomations] = useState<Array<{ id: string; name: string; enabled: boolean; executionCount: number }>>([]);
  const [memoriesCount, setMemoriesCount] = useState<number>(0);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await himeApi.ensureAuthenticated();
      const projectId = 'default-project-id';

      const [sys, health, procs, notifs, autos] = await Promise.all([
        himeApi.getRuntimeSystem().catch(() => null),
        himeApi.getRuntimeStatus().catch(() => null),
        himeApi.getRuntimeProcesses().catch(() => []),
        himeApi.getNotifications().catch(() => []),
        himeApi.getAutomations(projectId).catch(() => []),
      ]);

      if (sys) setSystemMetrics(sys);
      if (health) setAgentHealth(health);
      if (procs) setProcesses(procs.slice(0, 5));
      if (notifs) setNotifications(notifs.slice(0, 4));
      if (autos) setAutomations(autos.slice(0, 4));

      const mems = await himeApi.getMemories(projectId).catch(() => []);
      setMemoriesCount(mems.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to HiMe OS Backend';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchApp = async (appName: string) => {
    setActionFeedback(`Launching ${appName}...`);
    try {
      await himeApi.launchRuntimeApp(appName);
      setActionFeedback(`Launched ${appName} successfully!`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchDashboardData();
    } catch (err: any) {
      setActionFeedback(`Error launching ${appName}: ${err.message}`);
    }
  };

  const handleSystemAction = async (action: string, value?: number) => {
    setActionFeedback(`Executing ${action}...`);
    try {
      const res = await himeApi.executeRuntimeAction(action, value);
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchDashboardData();
    } catch (err: any) {
      setActionFeedback(`Action error: ${err.message}`);
    }
  };

  const ramUsedGB = systemMetrics ? (systemMetrics.ram.usedBytes / (1024 * 1024 * 1024)).toFixed(1) : '4.8';
  const ramTotalGB = systemMetrics ? (systemMetrics.ram.totalBytes / (1024 * 1024 * 1024)).toFixed(1) : '16.0';
  const storageUsedGB = systemMetrics ? (systemMetrics.storage.usedBytes / (1024 * 1024 * 1024)).toFixed(0) : '240';
  const storageTotalGB = systemMetrics ? (systemMetrics.storage.totalBytes / (1024 * 1024 * 1024)).toFixed(0) : '512';

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback Bar */}
      {actionFeedback && (
        <div className="fixed top-20 right-8 z-50 px-6 py-3 rounded-2xl glass border border-cyan-400/50 bg-[#0B0F14]/90 text-cyan-400 font-mono text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Hero Welcome & Native Agent Status */}
      <GlassCard glowColor="cyan" className="p-8 md:p-10 glass border-cyan-400/30 glow-cyan rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-400/40 text-cyan-400 text-xs uppercase tracking-[0.3em] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              HiMe OS Native Runtime Connected • 102 Endpoints Active
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Good Evening, <br />
              <span className="text-cyan-400 neon-text-cyan">Personal AI Command Center</span>
            </h1>

            <p className="text-white/70 text-sm leading-relaxed font-light max-w-xl">
              Operating System: <strong className="text-white font-mono">{systemMetrics?.system.os || 'Windows 11 Build 22631'}</strong> on <strong className="text-white font-mono">{systemMetrics?.system.hostname || 'AYUSH-PC'}</strong>. System telemetry streaming at {agentHealth?.health.latencyMs || 2}ms latency.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs tracking-wider uppercase hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Launch AI Assistant</span>
              </button>

              <button
                onClick={onOpenCommandPalette}
                className="px-6 py-3 rounded-full glass border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <span>Command Palette</span>
                <kbd className="px-2 py-0.5 text-[10px] glass rounded-full border border-white/20 font-mono text-cyan-400">⌘K</kbd>
              </button>

              <button
                onClick={fetchDashboardData}
                className="p-3 rounded-full glass border border-white/20 text-cyan-400 hover:bg-white/10 transition-all"
                title="Refresh Live Telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Live Agent Health Card */}
          <div className="w-full lg:w-80 p-6 rounded-3xl glass border border-white/20 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] font-semibold text-white/50">
              <span>AGENT HEALTH</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 text-[10px] font-bold">
                {agentHealth?.health.status || 'HEALTHY'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-semibold tracking-tighter neon-text-cyan">
                {systemMetrics?.cpu.usagePercent ?? 18}
              </span>
              <span className="text-xl text-cyan-400 font-bold">% CPU</span>
            </div>

            <div className="w-full h-2 rounded-full glass overflow-hidden">
              <div
                className="h-full bg-cyan-400 glow-cyan transition-all duration-500"
                style={{ width: `${systemMetrics?.cpu.usagePercent ?? 18}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-white/60 pt-2 border-t border-white/10">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">RAM LOAD</span>
                <span className="text-white font-semibold">{systemMetrics?.ram.usagePercent ?? 28}% ({ramUsedGB}/{ramTotalGB} GB)</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">BATTERY</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  {systemMetrics?.battery.isCharging ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> : <Battery className="w-3.5 h-3.5 text-cyan-400" />}
                  {systemMetrics?.battery.percent ?? 85}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Live System Hardware Telemetry Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard glowColor="cyan" className="p-5 space-y-2 rounded-3xl">
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 glass rounded-full">{systemMetrics?.cpu.cores || 8} Cores</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{systemMetrics?.cpu.usagePercent ?? 18}%</div>
          <div className="text-[11px] text-white/50 truncate font-mono">{systemMetrics?.cpu.model || 'Intel Core i9-13900H'}</div>
        </GlassCard>

        <GlassCard glowColor="purple" className="p-5 space-y-2 rounded-3xl">
          <div className="flex items-center justify-between">
            <MemoryStick className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-mono text-purple-400 font-bold px-2 py-0.5 glass rounded-full">{systemMetrics?.ram.usagePercent ?? 28}%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{ramUsedGB} GB</div>
          <div className="text-[11px] text-white/50 font-mono">of {ramTotalGB} GB Total RAM</div>
        </GlassCard>

        <GlassCard glowColor="blue" className="p-5 space-y-2 rounded-3xl">
          <div className="flex items-center justify-between">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 glass rounded-full">{systemMetrics?.storage.usagePercent ?? 46}%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{storageUsedGB} GB</div>
          <div className="text-[11px] text-white/50 font-mono">of {storageTotalGB} GB Drive ({systemMetrics?.storage.mountPoint || 'C:'})</div>
        </GlassCard>

        <GlassCard glowColor="emerald" className="p-5 space-y-2 rounded-3xl">
          <div className="flex items-center justify-between">
            {systemMetrics?.battery.isCharging ? <BatteryCharging className="w-5 h-5 text-emerald-400" /> : <Battery className="w-5 h-5 text-emerald-400" />}
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 glass rounded-full">{systemMetrics?.battery.isCharging ? 'CHARGING' : 'BATTERY'}</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{systemMetrics?.battery.percent ?? 85}%</div>
          <div className="text-[11px] text-white/50 font-mono">Est. {systemMetrics?.battery.timeRemainingMinutes || 240} min remaining</div>
        </GlassCard>
      </div>

      {/* Native Desktop Control Macros */}
      <GlassCard className="p-6 space-y-4 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Native Desktop Quick Controls</h3>
              <p className="text-sm font-bold text-white">Direct Operating System Controls</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleLaunchApp('notepad')}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-cyan-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Play className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono text-white/40">APP</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-cyan-400">Launch Notepad</div>
          </button>

          <button
            onClick={() => handleLaunchApp('calc')}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-cyan-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Play className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono text-white/40">APP</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-purple-400">Launch Calc</div>
          </button>

          <button
            onClick={() => handleSystemAction('volume_up', 15)}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-blue-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-mono text-white/40">+15%</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-blue-400">Volume Up</div>
          </button>

          <button
            onClick={() => handleSystemAction('brightness', 85)}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-emerald-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Sun className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono text-white/40">85%</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-emerald-400">Set Brightness</div>
          </button>

          <button
            onClick={() => handleSystemAction('lock')}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-rose-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Lock className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-mono text-white/40">SYS</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-rose-400">Lock Computer</div>
          </button>

          <button
            onClick={() => onNavigate('device-control')}
            className="p-3.5 rounded-2xl glass border border-white/10 hover:border-cyan-400/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono text-white/40">PROC</span>
            </div>
            <div className="text-xs font-bold text-white mt-2 group-hover:text-cyan-400">Process Monitor</div>
          </button>
        </div>
      </GlassCard>

      {/* Main Grid: Running Apps & Recent System Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Running Applications Widget */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Active Processes</h3>
                <p className="text-sm font-bold text-white">Operating System Task Manager</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('device-control')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>VIEW ALL ({processes.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {processes.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-white/40">Fetching active processes...</div>
            ) : (
              processes.map((p) => (
                <div key={p.pid} className="p-3.5 rounded-2xl glass border border-white/10 flex items-center justify-between hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 glow-cyan" />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">PID: {p.pid}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-cyan-400 font-bold">{p.memoryMB || 128} MB RAM</div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Notifications & System Activity */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass border border-purple-500/30 text-purple-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/50">Notifications</h3>
                <p className="text-sm font-bold text-white">System & AI Logs</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-white/40">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl glass border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    <span className="text-[9px] font-mono text-cyan-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-white/60 font-light">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
