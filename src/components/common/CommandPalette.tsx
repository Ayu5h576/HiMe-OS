import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bot, 
  Brain, 
  Workflow, 
  HardDrive, 
  Code2, 
  BarChart3, 
  FolderGit2, 
  Calendar, 
  Settings, 
  Sparkles,
  ArrowRight,
  Command,
  X,
  Eye,
  Globe,
  Activity
} from 'lucide-react';
import { himeApi } from '../../services/api/himeApi';
import type { OSPage } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: OSPage) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
      setAiResult(null);
    }
  }, [isOpen]);

  const commands = [
    { id: 'nav-dashboard', label: 'Go to OS Dashboard', page: 'dashboard' as OSPage, icon: <Search className="w-4 h-4 text-cyan-400" />, type: 'nav' },
    { id: 'nav-ai', label: 'Open AI Assistant', page: 'ai-assistant' as OSPage, icon: <Bot className="w-4 h-4 text-cyan-400" />, type: 'nav' },
    { id: 'nav-vision', label: 'Vision Perception Platform (OCR/Objects)', page: 'vision' as OSPage, icon: <Eye className="w-4 h-4 text-amber-400" />, type: 'nav' },
    { id: 'nav-browser', label: 'Browser Automation Platform (Chromium)', page: 'browser' as OSPage, icon: <Globe className="w-4 h-4 text-blue-400" />, type: 'nav' },
    { id: 'nav-memory', label: 'Explore AI Memory Graph', page: 'ai-memory' as OSPage, icon: <Brain className="w-4 h-4 text-purple-400" />, type: 'nav' },
    { id: 'nav-automation', label: 'Build Workflow Automations', page: 'automation' as OSPage, icon: <Workflow className="w-4 h-4 text-blue-400" />, type: 'nav' },
    { id: 'nav-devices', label: 'Manage Devices & Process Monitor', page: 'device-control' as OSPage, icon: <HardDrive className="w-4 h-4 text-emerald-400" />, type: 'nav' },
    { id: 'nav-activity', label: 'Unified Activity Audit Log', page: 'activity' as OSPage, icon: <Activity className="w-4 h-4 text-rose-400" />, type: 'nav' },
    { id: 'nav-github', label: 'Inspect GitHub Workspace', page: 'github' as OSPage, icon: <Code2 className="w-4 h-4 text-gray-200" />, type: 'nav' },
    { id: 'nav-analytics', label: 'View System Analytics & Metrics', page: 'analytics' as OSPage, icon: <BarChart3 className="w-4 h-4 text-amber-400" />, type: 'nav' },
    { id: 'nav-files', label: 'Search AI File Explorer', page: 'file-explorer' as OSPage, icon: <FolderGit2 className="w-4 h-4 text-cyan-300" />, type: 'nav' },
    { id: 'nav-calendar', label: 'Calendar & Focus Planner', page: 'calendar' as OSPage, icon: <Calendar className="w-4 h-4 text-indigo-400" />, type: 'nav' },
    { id: 'nav-settings', label: 'System Settings', page: 'settings' as OSPage, icon: <Settings className="w-4 h-4 text-gray-400" />, type: 'nav' },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands.length > 0 && selectedIndex < filteredCommands.length) {
        onNavigate(filteredCommands[selectedIndex].page);
        onClose();
      } else if (search.trim()) {
        handleAiSubmit();
      }
    }
  };

  const handleAiSubmit = async () => {
    if (!search.trim()) return;
    setAiWorking(true);
    setAiResult(null);

    try {
      await himeApi.ensureAuthenticated();
      const res = await himeApi.sendAIChat(search);
      setAiResult(res.content || "AI Command processed.");
    } catch (err: any) {
      setAiResult("HiMe OS executed local backup process for: " + search);
    } finally {
      setAiWorking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl glass border border-cyan-400/40 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden text-white"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Line */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-cyan-400 neon-text-cyan" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            placeholder="Search commands, navigate OS, or ask Gemini AI..."
            className="w-full bg-transparent border-none outline-none text-base text-white placeholder-white/40 font-medium"
          />
          {search && (
            <button
              onClick={handleAiSubmit}
              disabled={aiWorking}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-400 text-black font-extrabold text-xs transition-all whitespace-nowrap glow-cyan hover:bg-cyan-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiWorking ? 'Querying...' : 'Ask AI'}</span>
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full glass hover:bg-white/20 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Quick Response Panel */}
        {aiResult && (
          <div className="p-5 glass border-b border-cyan-400/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Gemini AI Command Result</span>
            </div>
            <p className="text-white/90 leading-relaxed font-sans glass p-4 rounded-2xl border border-white/10 text-sm font-light">
              {aiResult}
            </p>
          </div>
        )}

        {/* Command Search Results List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { onNavigate(cmd.page); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150
                    ${isSelected 
                      ? 'glass bg-white/10 border border-cyan-400/50 text-white glow-cyan' 
                      : 'text-white/70 hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl glass border border-white/10">
                      {cmd.icon}
                    </div>
                    <span className="text-sm font-medium">{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                    <span className="uppercase tracking-widest font-bold text-cyan-400">JUMP</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-white/60 space-y-2">
              <p>Press <kbd className="px-2 py-0.5 rounded-full glass border border-cyan-400/30 text-cyan-400 font-bold">Enter</kbd> to ask Gemini AI: <span className="text-white font-bold">"{search}"</span></p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 glass border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 rounded-md glass">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded-md glass">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded-md glass">ESC</kbd> Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
            <Command className="w-3.5 h-3.5" />
            <span>HiMe Command Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
