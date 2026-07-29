import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bot, 
  Brain, 
  Workflow, 
  HardDrive, 
  Code2, 
  BarChart3, 
  FolderGit2, 
  CalendarCheck, 
  Settings,
  ChevronRight,
  Sparkles,
  Eye,
  Globe,
  Activity
} from 'lucide-react';
import type { OSPage } from '../../types';

interface SidebarDockProps {
  currentPage: OSPage;
  onNavigate: (page: OSPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const navItems: { page: OSPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { page: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-5 h-5 text-cyan-400" />, badge: 'AI' },
    { page: 'vision', label: 'Vision Perception', icon: <Eye className="w-5 h-5 text-amber-400" /> },
    { page: 'browser', label: 'Browser Automation', icon: <Globe className="w-5 h-5 text-blue-400" /> },
    { page: 'ai-memory', label: 'AI Memory Graph', icon: <Brain className="w-5 h-5 text-purple-400" /> },
    { page: 'automation', label: 'Workflow Automations', icon: <Workflow className="w-5 h-5 text-blue-400" /> },
    { page: 'device-control', label: 'Device Hub & Processes', icon: <HardDrive className="w-5 h-5 text-emerald-400" />, badge: '102' },
    { page: 'activity', label: 'Activity Audit Log', icon: <Activity className="w-5 h-5 text-rose-400" /> },
    { page: 'file-explorer', label: 'File Explorer', icon: <FolderGit2 className="w-5 h-5 text-cyan-300" /> },
    { page: 'github', label: 'GitHub Workspace', icon: <Code2 className="w-5 h-5 text-gray-200" /> },
    { page: 'analytics', label: 'System Analytics', icon: <BarChart3 className="w-5 h-5 text-amber-400" /> },
    { page: 'calendar', label: 'Calendar & Tasks', icon: <CalendarCheck className="w-5 h-5 text-indigo-400" /> },
    { page: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5 text-gray-400" /> },
  ];

  return (
    <aside
      className={`
        sticky top-16 left-0 h-[calc(100vh-4rem)] z-30
        transition-all duration-300 ease-in-out
        glass border-r border-white/10
        flex flex-col justify-between py-4 px-3
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Upper Navigation Items */}
      <div className="space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`
                relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group
                ${isActive 
                  ? 'glass bg-white/10 text-white border border-cyan-400/40 glow-cyan' 
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSideBarTab"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full glow-cyan"
                />
              )}

              <div className={`p-1 rounded-lg transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400 neon-text-cyan' : 'text-white/60'}`}>
                {item.icon}
              </div>

              {!collapsed && (
                <span className="truncate tracking-wide">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className={`ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  item.badge === 'AI' 
                    ? 'bg-cyan-400 text-black glow-cyan' 
                    : 'glass text-white/80'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl glass text-white text-xs whitespace-nowrap shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse / Expand Toggle Button & Neural Core Status */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        {!collapsed && (
          <div className="p-3.5 rounded-2xl glass border border-cyan-400/30 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                NEURAL CORE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-cyan" />
            </div>
            <p className="text-white/60 text-[10px] leading-relaxed font-light">
              HiMe OS Backend on localhost:4000 (102 APIs active).
            </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2.5 rounded-2xl glass text-white/60 hover:text-white transition-all"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
};
