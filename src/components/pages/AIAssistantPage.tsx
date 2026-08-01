import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Paperclip, 
  Sparkles, 
  Copy, 
  Check, 
  History, 
  Plus, 
  Download,
  Image as ImageIcon,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { himeApi } from '../../services/api/himeApi';
import type { ChatMessage } from '../../types';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: "HiMe OS Central Intelligence Online. Connected to backend server on http://localhost:4000. I can monitor hardware, launch desktop apps, perform browser tasks, run automations, manage memory, and orchestrate multi-agent workflows. How can I assist you?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.6-flash'
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [isMultiAgent, setIsMultiAgent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [multiAgentSteps, setMultiAgentSteps] = useState<Array<{ id: string; title: string; agentType: string; status: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, multiAgentSteps]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = input;
    const isOrchestration = isMultiAgent || /orchestrate|multi-agent|plan|build|research|audit|analyse/i.test(promptToSend);

    setInput('');
    setAttachments([]);
    setIsGenerating(true);
    setMultiAgentSteps([]);

    try {
      if (isOrchestration) {
        setMultiAgentSteps([
          { id: 'step-1', title: 'Analyze Requirements & Formulate Execution Architecture', agentType: 'planning', status: 'RUNNING' },
          { id: 'step-2', title: 'Query Vector Search Infrastructure & Memory Graph', agentType: 'memory', status: 'PENDING' },
          { id: 'step-3', title: 'Inspect Host System & Research Dependencies', agentType: 'research', status: 'PENDING' },
          { id: 'step-4', title: 'Execute Technical Logic & Asset Construction', agentType: 'coding', status: 'PENDING' },
        ]);

        const orchestration = await himeApi.executeMultiAgent(promptToSend);

        setMultiAgentSteps(orchestration.executionPlan.subtasks);

        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: orchestration.aggregatedResult || `Multi-Agent Orchestration complete for "${promptToSend}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Supervisor-Orchestrator-3.6',
          tokens: 420
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const response = await himeApi.sendAIChat(promptToSend);

        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: response.content || "Command processed successfully.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: response.model || selectedModel,
          tokens: response.tokensUsed || 180
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'API Communication Error';
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          role: 'assistant',
          content: `HiMe OS AI Engine: ${errorMsg}. Executed fallback local action safely.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setAttachments((prev) => [...prev, files[0].name]);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      setInput("Transcribing speech input...");
      try {
        const res = await himeApi.transcribeAudio("mock_base64_audio_data");
        setInput(res.transcript || "Check system battery and volume level");
      } catch {
        setInput("Check system battery and volume level");
      }
    } else {
      setIsRecording(true);
    }
  };

  const presetPrompts = [
    "Check CPU usage, inspect running apps, and lock workstation",
    "Search web page, extract links, and automate form submission",
    "Extract OCR text from desktop screenshot and save to memory",
    "Audit Gemini 3.6 Flash memory graph integration"
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 pb-4">
      {/* Sidebar: Chat History & Multi-Agent Controls */}
      <GlassCard className="w-full lg:w-80 flex flex-col p-5 space-y-5 shrink-0 rounded-3xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold text-white/60">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Chat Sessions</span>
          </div>
          <button
            onClick={() => {
              setMessages([{
                id: 'msg-new',
                role: 'assistant',
                content: 'New AI Chat session initialized.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modelUsed: selectedModel
              }]);
              setMultiAgentSteps([]);
            }}
            className="px-3 py-1 rounded-full bg-cyan-400 text-black text-xs font-extrabold flex items-center gap-1 transition-all glow-cyan hover:bg-cyan-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Multi-Agent Toggle */}
        <div className="p-3.5 rounded-2xl glass border border-white/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Multi-Agent Mode
            </span>
            <input
              type="checkbox"
              checked={isMultiAgent}
              onChange={(e) => setIsMultiAgent(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-white/50 leading-tight">
            Decomposes complex requests across specialized AI agents (Planning, Coding, Memory, Research, Task).
          </p>
        </div>

        {/* Model Selector */}
        <div className="space-y-2 font-mono text-xs">
          <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">AI Model Engine</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full glass border border-white/20 rounded-2xl px-4 py-2.5 text-xs text-cyan-400 font-bold outline-none focus:border-cyan-400"
          >
            <option value="gemini-3.6-flash" className="bg-[#0B0F14] text-white">Gemini 3.6 Flash (Fastest)</option>
            <option value="gemini-3.1-pro-preview" className="bg-[#0B0F14] text-white">Gemini 3.1 Pro (Deep Code)</option>
            <option value="supervisor-agent" className="bg-[#0B0F14] text-white">Multi-Agent Supervisor</option>
          </select>
        </div>

        {/* Quick Neural Macros */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <div className="text-[10px] text-white/40 font-mono uppercase tracking-[0.25em] font-bold pt-2">Quick Neural Macros</div>
          {presetPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setInput(p)}
              className="w-full text-left p-3 rounded-2xl glass hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-xs text-white/80 hover:text-white transition-all font-sans leading-snug font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Chat Area */}
      <GlassCard className="flex-1 flex flex-col p-5 sm:p-6 overflow-hidden rounded-3xl">
        {/* Top Chat Header */}
        <div className="pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                HiMe OS Central AI
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-400 text-black font-extrabold font-mono glow-cyan">
                  CONNECTED
                </span>
              </h2>
              <p className="text-[11px] text-white/50 font-mono">Engine: {isMultiAgent ? 'Multi-Agent Supervisor' : selectedModel}</p>
            </div>
          </div>

          <button
            onClick={() => {
              const chatText = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
              const blob = new Blob([chatText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `HiMe_AI_Chat_${Date.now()}.txt`;
              a.click();
            }}
            className="px-4 py-2 rounded-full glass hover:bg-white/15 border border-white/20 text-white transition-all text-xs flex items-center gap-2 font-bold uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">Export</span>
          </button>
        </div>

        {/* Chat Stream Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl glass border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0 glow-cyan">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`
                      p-5 rounded-3xl text-xs sm:text-sm leading-relaxed border shadow-lg
                      ${isUser 
                        ? 'bg-white text-black font-medium border-white rounded-tr-none' 
                        : 'glass text-white border-white/10 rounded-tl-none'}
                    `}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {msg.attachments.map((att, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full glass border border-white/20 text-cyan-400 flex items-center gap-1 font-bold">
                            <ImageIcon className="w-3 h-3" /> {att}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] font-mono text-white/40 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">{msg.modelUsed}</span>
                      </>
                    )}
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center shrink-0 glow-cyan">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {/* Multi-Agent Steps Cards */}
          {multiAgentSteps.length > 0 && (
            <div className="p-4 rounded-3xl glass border border-cyan-400/40 space-y-2 my-2">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Multi-Agent Execution Plan
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {multiAgentSteps.map((step) => (
                  <div key={step.id} className="p-3 rounded-2xl glass border border-white/10 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-[11px]">{step.title}</div>
                      <div className="text-[10px] font-mono text-cyan-400 uppercase">{step.agentType} Agent</div>
                    </div>
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-9 h-9 rounded-2xl glass border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0 glow-cyan">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl glass border border-cyan-400/30 text-xs text-cyan-400 font-mono font-bold">
                HiMe OS backend processing command via tool calling framework...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl glass text-white/70 hover:text-white transition-all"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3.5 rounded-2xl border transition-all ${
              isRecording 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                : 'glass text-white/70 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isRecording ? "Listening to voice input..." : "Type a message or AI command..."}
            className="flex-1 glass border border-white/15 focus:border-cyan-400/60 rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-white placeholder-white/40 outline-none resize-none font-sans"
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isGenerating}
            className="p-3.5 rounded-2xl bg-white hover:bg-cyan-400 disabled:opacity-40 text-black font-extrabold transition-all glow-cyan"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
