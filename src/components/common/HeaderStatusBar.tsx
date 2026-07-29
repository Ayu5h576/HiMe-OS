import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import type { OSPage, SystemMetrics } from '../../types';

interface HeaderStatusBarProps {
  currentPage: OSPage;
  onOpenCommandPalette: () => void;
  onToggleNotifications: () => void;
  unreadCount: number;
  metrics: SystemMetrics;
  onNavigate: (page: OSPage) => void;
}

export const HeaderStatusBar: React.FC<HeaderStatusBarProps> = ({
  currentPage,
  onOpenCommandPalette,
  onToggleNotifications,
  unreadCount,
  metrics,
  onNavigate
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [showQuickSettings, setShowQuickSettings] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageTitles: Record<OSPage, string> = {
    'dashboard': 'OS Dashboard',
    'ai-assistant': 'Neural AI Assistant',
    'vision': 'Vision Perception',
    'browser': 'Browser Automation',
    'ai-memory': 'AI Memory Graph',
    'automation': 'Workflow Automations',
    'device-control': 'Connected Devices',
    'activity': 'Activity Audit Log',
    'github': 'GitHub Workspace',
    'analytics': 'System Analytics',
    'file-explorer': 'AI File Explorer',
    'calendar': 'Calendar & Tasks',
    'settings': 'System Settings'
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 px-6 lg:px-10 xl:px-12 glass border-b border-white/10 flex items-center justify-between">
      {/* Left Branding & Page Indicator */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-[#0B0F14] font-extrabold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300">
            H
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-white/60">HiMe OS</span>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-cyan-400 neon-text-cyan">{pageTitles[currentPage]}</span>
          </div>
        </div>
      </div>

      {/* Middle Command Bar Launcher */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center justify-between w-80 px-4 py-2 glass-pill hover:border-cyan-400/50 rounded-full text-xs text-white/50 transition-all duration-200 group shadow-inner"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-light">Ask HiMe or run command...</span>
        </div>
        <kbd className="px-2 py-0.5 text-[10px] font-mono glass rounded-full text-white/70 border border-white/20">
          ⌘K
        </kbd>
      </button>

      {/* Right Telemetry & Quick Controls */}
      <div className="flex items-center gap-4">
        {/* Live AI Agent Active Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full glass border border-emerald-500/30 text-[10px] font-mono text-emerald-300 tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase font-semibold opacity-90">102 ENDPOINTS ACTIVE</span>
        </div>

        {/* Audio Ambient Mute Toggle */}
        <button
          onClick={() => setAudioMuted(!audioMuted)}
          title={audioMuted ? "Unmute Ambient Soundscapes" : "Mute Soundscapes"}
          className="p-2 rounded-full glass text-white/70 hover:text-white transition-all"
        >
          {audioMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-full glass text-white/70 hover:text-white transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[10px] font-extrabold text-black flex items-center justify-center glow-cyan">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Quick System Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-white/80 transition-all hover:bg-white/10"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:block font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider">SYSTEM OK</span>
          </button>

          {showQuickSettings && (
            <div className="absolute right-0 mt-3 w-64 p-5 rounded-3xl glass shadow-2xl z-50 space-y-3 text-xs border border-white/20">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-semibold text-white tracking-wide">System Diagnostics</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>CPU Load</span>
                  <span className="text-cyan-400">{metrics.cpuUsage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${metrics.cpuUsage}%` }} />
                </div>

                <div className="flex justify-between text-gray-300 pt-1">
                  <span>RAM Usage</span>
                  <span className="text-purple-400">{metrics.ramUsageGB} GB / {metrics.ramTotalGB} GB</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${(metrics.ramUsageGB / metrics.ramTotalGB) * 100}%` }} />
                </div>

                <div className="flex justify-between text-gray-300 pt-1">
                  <span>Neural Latency</span>
                  <span className="text-emerald-400">{metrics.neuralLatencyMs} ms</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px]">
                <button 
                  onClick={() => { setShowQuickSettings(false); onNavigate('settings'); }}
                  className="w-full py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-center transition-colors"
                >
                  Full OS Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Clock */}
        <div className="hidden sm:flex flex-col items-end text-right font-light text-base text-white">
          <span>{timeStr}</span>
          <span className="text-[10px] uppercase font-semibold text-white/40 tracking-widest">{dateStr}</span>
        </div>
      </div>
    </header>
  );
};
