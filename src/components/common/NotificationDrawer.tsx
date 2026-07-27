import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Bot, 
  Code2, 
  HardDrive, 
  Info, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import type { NotificationItem, OSPage } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigate: (page: OSPage) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNavigate
}) => {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    'system': <Info className="w-4 h-4 text-blue-400" />,
    'ai-agent': <Bot className="w-4 h-4 text-cyan-400" />,
    'github': <Code2 className="w-4 h-4 text-gray-200" />,
    'iot': <HardDrive className="w-4 h-4 text-emerald-400" />,
    'reminder': <AlertTriangle className="w-4 h-4 text-amber-400" />
  };

  const filtered = notifications.filter(n => filter === 'all' || n.category === filter);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0B0F14]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 text-white">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <p className="text-[11px] text-gray-400 font-mono">HiMe OS Live Event Stream</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
        {['all', 'ai-agent', 'github', 'iot', 'system'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-lg capitalize font-mono text-[11px] whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`
                p-3.5 rounded-xl border transition-all duration-200 space-y-2
                ${item.read 
                  ? 'bg-white/[0.02] border-white/5 opacity-75' 
                  : 'bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white/5 border border-white/10">
                    {categoryIcons[item.category] || <Info className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <span className="text-xs font-semibold text-white">{item.title}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">{item.timestamp}</span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {item.message}
              </p>

              {item.actionLabel && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      if (item.actionId === 'nav-analytics') onNavigate('analytics');
                      if (item.actionId === 'nav-github') onNavigate('github');
                      if (item.actionId === 'nav-ai-memory') onNavigate('ai-memory');
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-gray-500 space-y-2">
            <p>No notifications in this category.</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono">
        <button
          onClick={onMarkAllAsRead}
          className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-300 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark Read</span>
        </button>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-gray-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};
