import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bot, 
  ShieldCheck, 
  Palette, 
  Terminal, 
  Check, 
  Save
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ai');
  const [accentGlow, setAccentGlow] = useState<string>('electric-blue');
  const [aiModel, setAiModel] = useState<string>('gemini-3.6-flash');
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: <User className="w-4 h-4 text-cyan-400" /> },
    { id: 'ai', label: 'AI & Gemini Engine', icon: <Bot className="w-4 h-4 text-purple-400" /> },
    { id: 'privacy', label: 'Privacy & Guardrails', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'appearance', label: 'Appearance & Glow Theme', icon: <Palette className="w-4 h-4 text-amber-400" /> },
    { id: 'developer', label: 'Developer Mode', icon: <Terminal className="w-4 h-4 text-rose-400" /> },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <GlassCard className="p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-white/20 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                System Settings
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  v2.5 Config
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Neural layer parameters, model preferences, and security permissions</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all glow-cyan"
          >
            {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Main Grid: Tabs & Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <GlassCard className="p-4 space-y-2 rounded-3xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-cyan-400 text-black font-extrabold glow-cyan' 
                  : 'text-white/60 hover:text-white hover:bg-white/10 glass border border-transparent'}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </GlassCard>

        {/* Tab Content Panel */}
        <GlassCard className="lg:col-span-3 p-6 space-y-6 rounded-3xl">
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" /> Gemini Engine Preferences
                </h3>
                <p className="text-xs text-white/50 font-mono">Configure default model aliases and neural response parameters</p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-2">
                  <label className="text-white font-bold block uppercase tracking-wider text-[11px]">Default AI Model Engine</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full max-w-md p-3.5 rounded-2xl glass border border-white/20 text-cyan-400 font-bold outline-none cursor-pointer"
                  >
                    <option value="gemini-3.6-flash" className="bg-black text-white">Gemini 3.6 Flash (Recommended / Ultra Fast)</option>
                    <option value="gemini-3.1-pro-preview" className="bg-black text-white">Gemini 3.1 Pro (Advanced Reasoning & STEM)</option>
                    <option value="gemini-3.1-flash-lite" className="bg-black text-white">Gemini 3.1 Flash-Lite</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between p-4 rounded-2xl glass border border-white/10">
                  <div>
                    <span className="text-white font-bold block">Automated Daily Memory Summarization</span>
                    <span className="text-white/40 text-[11px]">Compress chat logs into vector memory nodes at midnight</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSummarize}
                    onChange={(e) => setAutoSummarize(e.target.checked)}
                    className="w-5 h-5 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" /> Appearance & Ambient Lighting
                </h3>
                <p className="text-xs text-white/50 font-mono">Select high-contrast futuristic color glows</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'electric-blue', label: 'Electric Blue', color: 'border-blue-400 bg-blue-500/20' },
                  { id: 'neon-cyan', label: 'Neon Cyan', color: 'border-cyan-400 bg-cyan-500/20' },
                  { id: 'royal-purple', label: 'Royal Purple', color: 'border-purple-400 bg-purple-500/20' },
                  { id: 'emerald', label: 'Soft Emerald', color: 'border-emerald-400 bg-emerald-500/20' },
                  { id: 'obsidian', label: 'Obsidian Charcoal', color: 'border-gray-400 bg-gray-500/20' },
                ].map((glow) => (
                  <button
                    key={glow.id}
                    onClick={() => setAccentGlow(glow.id)}
                    className={`p-4 rounded-2xl border text-xs font-mono text-left transition-all ${
                      accentGlow === glow.id 
                        ? `${glow.color} text-white font-extrabold glow-cyan` 
                        : 'glass border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {glow.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-rose-400" /> Developer Mode & Telemetry
                </h3>
                <p className="text-xs text-white/50 font-mono">Raw system logs and RPC command bus access</p>
              </div>

              <div className="p-4 rounded-2xl glass border border-white/10 font-mono text-xs text-emerald-400 space-y-1.5">
                <div>[SYSTEM] HiMe OS v2.5 Kernel Initialized</div>
                <div>[EXPRESS] Bound to host 0.0.0.0:3000</div>
                <div>[GEMINI] GoogleGenAI SDK user-agent header set to 'aistudio-build'</div>
                <div>[TELEMETRY] 14 neural threads active, latency 48ms</div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl glass border border-white/10 space-y-2">
                <div className="text-white font-bold">User Identity: Lead Intelligence Engineer</div>
                <div className="text-white/50">Email: user@hime.os</div>
                <div className="text-cyan-400 font-extrabold">Tier: Neural Pro Developer Edition</div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl glass border border-white/10 space-y-2 text-white/80">
                <div className="text-white font-bold">Privacy & Security Guardrails</div>
                <p className="text-white/50 font-sans leading-relaxed">
                  All Gemini API calls proxy through server-side routes (/api/*). Secrets are stored strictly in environment variables.
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
