import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  FileText, 
  Music, 
  Send, 
  Check, 
  Play, 
  Pause,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { SystemMetrics, OSPage } from '../../types';

interface DesktopWidgetsProps {
  metrics: SystemMetrics;
  onNavigate?: (page: OSPage) => void;
}

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({ metrics }) => {
  const [quickNote, setQuickNote] = useState<string>('HiMe OS Memory Note: Sync Gemini 3.6 Flash pipeline before deployment.');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-none">
      {/* Toggle Collapsed Floating Widget Dock */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-[#0D1219]/90 border border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-xl flex items-center gap-2 text-xs font-mono font-medium hover:bg-white/10 transition-all"
      >
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span>OS Desktop Floating Hub</span>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {!collapsed && (
        <div className="pointer-events-auto w-80 space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
          {/* Quick AI Note Scratchpad */}
          <div className="p-3.5 rounded-2xl bg-[#0D1219]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <FileText className="w-3.5 h-3.5" /> Quick AI Scratchpad
              </span>
              <button
                onClick={handleSaveNote}
                className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-mono hover:bg-cyan-500/30 transition-colors"
              >
                {noteSaved ? <Check className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
                <span>{noteSaved ? 'Saved' : 'Pin Memory'}</span>
              </button>
            </div>
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-cyan-500/40 resize-none font-sans"
            />
          </div>

          {/* System Neural CPU & Audio Control */}
          <div className="p-3.5 rounded-2xl bg-[#0D1219]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400">NEURAL LOAD</div>
                <div className="text-white font-bold">{metrics.cpuUsage}% / {metrics.ramUsageGB}GB</div>
              </div>
            </div>

            <button
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 text-[11px] font-semibold transition-all"
            >
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              {isPlayingSound ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingSound ? 'Playing Cyber 432Hz' : 'Focus Ambient'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
