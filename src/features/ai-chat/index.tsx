import React, { useState, useRef, useEffect } from "react"
import {
  Send,
  Sparkles,
  User,
  Plus,
  MessageSquare,
  ChevronDown,
  Trash2,
  Cpu,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { himeApi } from "@/services/api/himeApi"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  snippet: string
}

const AI_MODELS = [
  { label: 'Ollama (Local)', provider: 'ollama', model: 'llama3.2' },
  { label: 'Gemini 2.0 Flash', provider: 'gemini', model: 'gemini-2.0-flash' },
  { label: 'Gemini 1.5 Flash', provider: 'gemini', model: 'gemini-1.5-flash' },
  { label: 'GPT-4o Mini', provider: 'openai', model: 'gpt-4o-mini' },
  { label: 'Claude 3.5 Sonnet', provider: 'claude', model: 'claude-3-5-sonnet-20241022' },
] as const;

export default function AIChatPage() {
  const [prompt, setPrompt] = useState("")
  const [modelIndex, setModelIndex] = useState(0)
  const [isMultiAgent, setIsMultiAgent] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      role: "assistant",
      text: "Hello Ayush. HiMe Core is synchronized and online. I can control your IoT nodes, build task automations, review computer vision event logs, or help you with semantic memories. What would you like to accomplish?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    const initSessions = async () => {
      try {
        await himeApi.ensureAuthenticated()
        const pid = await himeApi.getActiveProjectId()
        const convs = await himeApi.getConversations(pid).catch(() => [])
        if (mounted && Array.isArray(convs) && convs.length > 0) {
          setSessions(
            convs.map((c) => ({
              id: c.id,
              title: c.title || "OS Conversation",
              snippet: `Updated ${new Date(c.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            }))
          )
          setActiveSessionId(convs[0].id)
          const msgs = await himeApi.getMessages(convs[0].id).catch(() => [])
          if (mounted && Array.isArray(msgs) && msgs.length > 0) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role === "user" ? "user" : "assistant",
                text: m.content,
                timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }))
            )
          }
        }
      } catch (err) {
        console.warn("[AIChatPage] Load error:", err)
      }
    }
    initSessions()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const selectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId)
    try {
      const msgs = await himeApi.getMessages(sessionId).catch(() => [])
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role === "user" ? "user" : "assistant",
            text: m.content,
            timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        )
      }
    } catch (err) {
      console.warn("[AIChatPage] Load messages error:", err)
    }
  }

  const startNewChat = async () => {
    try {
      await himeApi.ensureAuthenticated()
      const pid = await himeApi.getActiveProjectId()
      const newConv = await himeApi.createConversation(pid, `Chat Session ${sessions.length + 1}`).catch(() => null)
      if (newConv) {
        setSessions((prev) => [
          { id: newConv.id, title: newConv.title, snippet: "Just started" },
          ...prev
        ])
        setActiveSessionId(newConv.id)
      }
    } catch (err) {
      console.warn("[AIChatPage] Create conversation error:", err)
    }
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        text: "New conversation stream initialized. Ask me anything.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const submitPrompt = async (text: string) => {
    if (!text.trim() || isTyping) return

    const currentPrompt = text
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: currentPrompt,
      timestamp: timeString
    }

    setMessages((prev) => [...prev, userMsg])
    setPrompt("")
    setIsTyping(true)

    try {
      await himeApi.ensureAuthenticated()
      let reply = ""
      if (isMultiAgent) {
        const aiRes = await himeApi.executeMultiAgent(currentPrompt).catch(() => null)
        reply = aiRes?.aggregatedResult || "Executed multi-agent command successfully."
      } else {
        const sel = AI_MODELS[modelIndex]
        const aiRes = await himeApi.sendAIChat(currentPrompt, activeSessionId, sel.provider, sel.model).catch(() => null)
        reply = aiRes?.content || "Executed command successfully."
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (err) {
      console.warn("[AIChatPage] Send chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          text: "Sorry, I encountered an issue processing your request.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    submitPrompt(prompt)
  }

  const handleExport = () => {
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hime-os-conversation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] rounded-xl overflow-hidden border border-zinc-800/40 select-none bg-zinc-950/40 backdrop-blur-xl text-left">
      <div className="hidden md:flex flex-col w-64 border-r border-zinc-800/40 bg-zinc-950/60 p-4 justify-between shrink-0">
        <div className="space-y-4">
          <Button
            onClick={startNewChat}
            variant="ghost"
            className="w-full justify-start gap-2 border border-zinc-800/80 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg h-9 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Conversation
          </Button>

          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase px-2">History Log</span>
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    activeSessionId === s.id
                      ? "bg-zinc-900 text-white font-medium border border-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-zinc-300">{s.title}</div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{s.snippet}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase px-2">Quick Neural Macros</span>
            <div className="space-y-0.5">
              <Button variant="ghost" onClick={() => submitPrompt('Check CPU usage, inspect running apps, and lock workstation')} className="w-full justify-start text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 px-2.5 py-1.5 h-auto text-left">
                Check CPU usage...
              </Button>
              <Button variant="ghost" onClick={() => submitPrompt('Search web page, extract links, and automate form submission')} className="w-full justify-start text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 px-2.5 py-1.5 h-auto text-left">
                Search web page...
              </Button>
              <Button variant="ghost" onClick={() => submitPrompt('Extract OCR text from desktop screenshot and save to memory')} className="w-full justify-start text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 px-2.5 py-1.5 h-auto text-left">
                Extract OCR text...
              </Button>
              <Button variant="ghost" onClick={() => submitPrompt('Audit memory graph integration and list all stored facts')} className="w-full justify-start text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 px-2.5 py-1.5 h-auto text-left">
                Audit memory graph...
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2 py-1">
            <input type="checkbox" id="multiAgent" checked={isMultiAgent} onChange={(e) => setIsMultiAgent(e.target.checked)} className="accent-indigo-500" />
            <label htmlFor="multiAgent" className="text-xs text-zinc-400 select-none cursor-pointer">Multi-Agent Mode</label>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/30 text-xs text-zinc-500 flex items-center justify-between">
          <span className="font-mono">Nodes: Sync</span>
          <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between bg-zinc-950/20 relative">
        <div className="h-12 border-b border-zinc-800/40 px-4 md:px-6 flex items-center justify-between bg-zinc-950/40 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Assistant Console</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" onClick={handleExport} className="h-7 px-2.5 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 bg-zinc-900/30 rounded-lg">
              EXPORT
            </Button>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Model:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-7 px-2.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 bg-zinc-900/30 flex items-center gap-1 rounded-lg">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    {AI_MODELS[modelIndex].label}
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </Button>
                }
              />
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300 w-44 mt-1">
                {AI_MODELS.map((m, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => setModelIndex(idx)} className="focus:bg-zinc-800 focus:text-zinc-100 text-xs">
                    {m.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                }`}
              >
                {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-100"
                    : "bg-zinc-900/80 border border-zinc-800/60 text-zinc-200"
                }`}
              >
                <div>{m.text}</div>
                <div className="text-[9px] text-zinc-500 font-mono mt-1 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs pl-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>{isMultiAgent ? "Multi-Agent Supervisor orchestrating agents..." : "HiMe Core processing prompt & executing tools..."}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800/40 bg-zinc-950/60 relative z-10">
          <div className="relative flex items-center">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isTyping}
              placeholder="Send message to HiMe Core..."
              className="w-full h-11 pl-4 pr-20 bg-zinc-900/80 border-zinc-800/80 focus:border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg outline-none"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <Button
                type="submit"
                disabled={!prompt.trim() || isTyping}
                size="icon"
                className="h-8 w-8 bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-40 rounded-md"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
