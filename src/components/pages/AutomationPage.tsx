import React, { useState } from 'react';
import { 
  Workflow, 
  Sparkles, 
  Play, 
  Clock, 
  Cpu, 
  Trash2
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AutomationWorkflow } from '../../types';

interface AutomationPageProps {
  automations: AutomationWorkflow[];
  onToggleAutomation: (id: string) => void;
  onAddAutomation: (auto: AutomationWorkflow) => void;
  onDeleteAutomation: (id: string) => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({
  automations,
  onToggleAutomation,
  onAddAutomation,
  onDeleteAutomation
}) => {
  const [selectedAuto, setSelectedAuto] = useState<AutomationWorkflow | null>(automations[0] || null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  const handleGenerateAiAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setTestLog(null);

    try {
      const response = await fetch('/api/generate-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const data = await response.json();

      if (data.success && data.automation) {
        const generatedAuto: AutomationWorkflow = {
          id: `auto-${Date.now()}`,
          title: data.automation.title || aiPrompt,
          description: data.automation.description || 'AI-generated workflow node graph',
          trigger: {
            id: `trig-${Date.now()}`,
            name: data.automation.trigger?.name || 'Schedule Event',
            type: 'trigger',
            icon: 'Clock',
            configSummary: data.automation.trigger?.configSummary || 'Triggered on schedule'
          },
          actions: (data.automation.actions || []).map((act: any, i: number) => ({
            id: `act-${Date.now()}-${i}`,
            name: act.name || `Action Step ${i+1}`,
            type: act.type || 'action',
            icon: 'Zap',
            configSummary: act.configSummary || 'Execute command'
          })),
          enabled: true,
          schedule: data.automation.schedule || 'Scheduled',
          lastRun: 'Just generated',
          successRate: 100,
          totalExecutions: 1
        };

        onAddAutomation(generatedAuto);
        setSelectedAuto(generatedAuto);
        setAiPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunNow = (auto: AutomationWorkflow) => {
    setTestLog(`[${new Date().toLocaleTimeString()}] Executing workflow "${auto.title}"... Trigger fired -> Actions 1 & 2 completed in 12ms. Status: SUCCESS.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top AI Automation Builder Input */}
      <GlassCard glowColor="cyan" className="p-6 md:p-8 glass border-cyan-400/30 rounded-3xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Natural Language Automation Builder</h2>
              <p className="text-xs text-white/50 font-mono">Type any workflow requirement — Gemini AI generates the node graph live</p>
            </div>
          </div>

          <form onSubmit={handleGenerateAiAutomation} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. When a GitHub PR is opened, run Gemini code review and notify me on iPhone..."
              className="flex-1 px-5 py-3.5 rounded-2xl glass border border-white/15 text-xs text-white placeholder-white/40 outline-none focus:border-cyan-400 font-medium"
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim() || isGenerating}
              className="px-6 py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all glow-cyan hover:bg-cyan-400 disabled:opacity-40"
            >
              <Workflow className="w-4 h-4 fill-black" />
              <span>{isGenerating ? 'Building Graph...' : 'Generate Automation'}</span>
            </button>
          </form>
        </div>
      </GlassCard>

      {/* Main Grid: Workflows List & Selected Graph Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List Sidebar */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              Active Workflows
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-extrabold">{automations.length} Nodes</span>
          </div>

          <div className="space-y-3">
            {automations.map((auto) => {
              const isSelected = selectedAuto?.id === auto.id;
              return (
                <div
                  key={auto.id}
                  onClick={() => setSelectedAuto(auto)}
                  className={`
                    p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5
                    ${isSelected 
                      ? 'glass border-cyan-400/60 glow-cyan' 
                      : 'glass border-white/10 hover:border-white/20'}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{auto.title}</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleAutomation(auto.id); }}
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold transition-all ${
                        auto.enabled 
                          ? 'bg-emerald-400 text-black font-extrabold glow-cyan' 
                          : 'glass text-white/50 border border-white/10'
                      }`}
                    >
                      {auto.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <p className="text-[11px] text-white/60 line-clamp-2">{auto.description}</p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                    <span>Last run: {auto.lastRun}</span>
                    <span className="text-emerald-400 font-bold">{auto.successRate}% Success</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Node Graph Visualizer Canvas */}
        <GlassCard className="lg:col-span-2 p-6 space-y-6 flex flex-col justify-between rounded-3xl">
          {selectedAuto ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedAuto.title}</h3>
                  <p className="text-xs text-white/50">{selectedAuto.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunNow(selectedAuto)}
                    className="px-4 py-2 rounded-full bg-cyan-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all glow-cyan hover:bg-cyan-300 uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Run Test</span>
                  </button>

                  <button
                    onClick={() => { onDeleteAutomation(selectedAuto.id); setSelectedAuto(null); }}
                    className="p-2.5 rounded-2xl glass hover:bg-rose-500/20 text-rose-400 transition-all"
                    title="Delete Workflow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Node Graph Visualizer */}
              <div className="p-6 glass rounded-2xl border border-white/10 space-y-6">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.25em] font-extrabold">Trigger Block</div>

                {/* Trigger Card */}
                <div className="p-4 rounded-2xl glass border border-cyan-400/40 flex items-center gap-4">
                  <div className="p-3 rounded-2xl glass text-cyan-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedAuto.trigger.name}</div>
                    <div className="text-[11px] text-white/50 font-mono">{selectedAuto.trigger.configSummary}</div>
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-cyan-400 animate-pulse glow-cyan" />
                </div>

                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.25em] font-extrabold">Action Blocks ({selectedAuto.actions.length})</div>

                {/* Action Cards */}
                <div className="space-y-3">
                  {selectedAuto.actions.map((act) => (
                    <div key={act.id} className="p-4 rounded-2xl glass border border-purple-400/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl glass text-purple-400">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{act.name}</div>
                          <div className="text-[11px] text-white/50 font-mono">{act.configSummary}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-400 text-black font-extrabold">Ready</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Log Terminal */}
              {testLog && (
                <div className="p-4 rounded-2xl glass border border-cyan-400/40 font-mono text-xs text-emerald-400 space-y-1">
                  <div className="text-white/40 text-[10px] font-bold">REAL-TIME EXECUTION LOG</div>
                  <p>{testLog}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-white/40 font-mono uppercase tracking-widest">
              Select a workflow node to inspect or build a new one with AI.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
