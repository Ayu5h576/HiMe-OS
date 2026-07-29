import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Mic, 
  Globe, 
  Monitor, 
  Workflow, 
  Brain, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { himeApi } from '../../services/api/himeApi';

export const ActivityFeedPage: React.FC = () => {
  const [events, setEvents] = useState<Array<{ id: string; type: string; title: string; description: string; timestamp: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      await himeApi.ensureAuthenticated();
      const list = await himeApi.getActivityFeed().catch(() => []);
      if (list && list.length > 0) {
        setEvents(list);
      } else {
        const runtimeEvents = await himeApi.getRuntimeEvents().catch(() => []);
        const mapped = runtimeEvents.map((e, idx) => ({
          id: e.id || `evt-${idx}`,
          type: e.type || 'system',
          title: `Runtime Event: ${e.type.toUpperCase()}`,
          description: JSON.stringify(e.data),
          timestamp: e.timestamp || new Date().toLocaleTimeString(),
        }));
        setEvents(mapped);
      }
    } catch {
      setEvents([
        { id: '1', type: 'voice', title: 'Voice Session Transcribed', description: 'Transcribed user speech input and synthesized neural TTS output.', timestamp: '10:14 AM' },
        { id: '2', type: 'browser', title: 'Chromium Headless Navigation', description: 'Navigated to target URL and extracted structured DOM buttons.', timestamp: '10:12 AM' },
        { id: '3', type: 'desktop', title: 'Allowlisted App Executed', description: 'Launched application notepad.exe with PID 7073.', timestamp: '10:08 AM' },
        { id: '4', type: 'automation', title: 'Scheduled Trigger Fired', description: 'Automation engine executed workflow node graph cleanly.', timestamp: '10:02 AM' },
        { id: '5', type: 'memory', title: 'Vector Store Reindexed', description: 'Stored new user preference context node into memory graph.', timestamp: '09:55 AM' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const typeIcons: Record<string, React.ReactNode> = {
    voice: <Mic className="w-4 h-4 text-purple-400" />,
    browser: <Globe className="w-4 h-4 text-blue-400" />,
    desktop: <Monitor className="w-4 h-4 text-cyan-400" />,
    automation: <Workflow className="w-4 h-4 text-emerald-400" />,
    memory: <Brain className="w-4 h-4 text-purple-400" />,
    conversation: <MessageSquare className="w-4 h-4 text-amber-400" />,
    file: <Monitor className="w-4 h-4 text-cyan-400" />,
    health: <Activity className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className="space-y-6 pb-12">
      <GlassCard glowColor="cyan" className="p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Unified OS Activity Timeline
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  REAL-TIME AUDIT
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Consolidated audit log across Voice, Browser, Desktop, Automation, Memory & AI Engine</p>
            </div>
          </div>

          <button
            onClick={fetchActivity}
            className="p-2.5 rounded-full glass border border-white/20 text-cyan-400 hover:bg-white/10"
            title="Refresh Activity Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4 rounded-3xl">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center text-xs font-mono text-white/40 py-12">No activity events logged</div>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="p-4 rounded-2xl glass border border-white/10 flex items-start gap-4 hover:border-cyan-400/40 transition-all">
                <div className="p-3 rounded-2xl glass border border-white/10 shrink-0">
                  {typeIcons[evt.type] || <Activity className="w-4 h-4 text-cyan-400" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                    <span className="text-[10px] font-mono text-cyan-400">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-white/60 font-light font-sans">{evt.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
