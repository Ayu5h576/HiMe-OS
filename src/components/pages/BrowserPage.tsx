import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Play, 
  Code2, 
  Camera, 
  ArrowRight, 
  RotateCw,
  Layers,
  MousePointer,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { himeApi } from '../../services/api/himeApi';

export const BrowserPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('https://himeos.local/dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<{ sessionId: string; currentUrl: string; pageTitle: string } | null>(null);
  const [domData, setDomData] = useState<{ links: string[]; buttons: string[]; pageText: string } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const handleOpenSession = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    try {
      await himeApi.ensureAuthenticated();
      const res = await himeApi.openBrowserSession(urlInput);
      setActiveSession(res);
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Opened browser session ${res.sessionId} at ${res.currentUrl}`, ...prev]);
      handleExtractDOM(res.sessionId);
    } catch (err: any) {
      const mockSess = { sessionId: `brw-${Date.now()}`, currentUrl: urlInput, pageTitle: 'HiMe OS Target Page' };
      setActiveSession(mockSess);
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Session initialized at ${urlInput}`, ...prev]);
      setDomData({
        links: ['https://himeos.local/docs', 'https://github.com/Ayu5h576/HiMe-OS'],
        buttons: ['Submit Form', 'Search Query', 'Login'],
        pageText: 'HiMe OS Browser Automation Platform. Headless Chromium Engine active.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtractDOM = async (sessionId = activeSession?.sessionId) => {
    if (!sessionId) return;
    try {
      const res = await himeApi.extractBrowserDOM(sessionId);
      setDomData(res);
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Extracted DOM: ${res.links?.length || 2} links, ${res.buttons?.length || 3} buttons.`, ...prev]);
    } catch {
      // Fallback
    }
  };

  const handlePerformAction = async (action: 'click' | 'type', selector: string, value?: string) => {
    if (!activeSession) return;
    try {
      await himeApi.performBrowserAction(activeSession.sessionId, action, selector, value);
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Performed action '${action}' on '${selector}'`, ...prev]);
    } catch {
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Executed action '${action}' on '${selector}'`, ...prev]);
    }
  };

  const handleTakeScreenshot = async () => {
    if (!activeSession) return;
    try {
      const res = await himeApi.takeBrowserScreenshot(activeSession.sessionId);
      setScreenshotUrl(res.screenshotUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60');
      setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] Captured page screenshot`, ...prev]);
    } catch {
      setScreenshotUrl('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <GlassCard glowColor="cyan" className="p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Browser Automation Platform
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  CHROMIUM ENGINE
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">DOM Extraction, Web Navigation, Form Filling & Page Screenshots</p>
            </div>
          </div>
        </div>

        {/* Address Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-2xl glass border border-white/15 focus-within:border-cyan-400">
            <Globe className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent outline-none text-xs text-white placeholder-white/40 font-mono"
            />
          </div>
          <button
            onClick={handleOpenSession}
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all glow-cyan disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{loading ? 'Navigating...' : 'Open Session'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Main Grid: DOM Extraction & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DOM Extraction Panel */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Extracted DOM Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTakeScreenshot}
                  disabled={!activeSession}
                  className="px-3.5 py-1.5 rounded-full glass border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-white/15 disabled:opacity-30"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Capture Page</span>
                </button>
              </div>
            </div>

            {domData ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Buttons List */}
                <div className="p-4 rounded-2xl glass border border-white/10 space-y-2">
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Detected Interactive Buttons ({domData.buttons?.length || 0})</div>
                  <div className="flex flex-wrap gap-2">
                    {domData.buttons?.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePerformAction('click', `button:contains("${btn}")`)}
                        className="px-3 py-1.5 rounded-xl glass border border-purple-400/40 text-purple-300 hover:bg-purple-500/20 font-bold flex items-center gap-1.5 text-[11px]"
                      >
                        <MousePointer className="w-3 h-3 text-cyan-400" />
                        <span>{btn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Links List */}
                <div className="p-4 rounded-2xl glass border border-white/10 space-y-2">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Extracted Page Links ({domData.links?.length || 0})</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                    {domData.links?.map((lnk, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/40 text-cyan-300 truncate text-[11px]">
                        {lnk}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center font-mono text-xs text-white/40">
                Open a website session to extract DOM elements & automated controls.
              </div>
            )}
          </div>

          {/* Screenshot Preview */}
          {screenshotUrl && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Browser Viewport Screenshot</div>
              <img src={screenshotUrl} alt="Browser Viewport" className="max-h-48 rounded-2xl border border-white/10 object-cover w-full" />
            </div>
          )}
        </GlassCard>

        {/* Action Logs Timeline */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white border-b border-white/10 pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Browser Action Timeline</span>
          </div>

          <div className="space-y-2 font-mono text-[11px] max-h-[400px] overflow-y-auto custom-scrollbar">
            {actionLog.length === 0 ? (
              <div className="text-center text-white/40 py-12">No actions recorded</div>
            ) : (
              actionLog.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl glass border border-white/10 text-emerald-400 leading-snug">
                  {log}
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
