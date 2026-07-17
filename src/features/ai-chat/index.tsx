import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  Sparkles,
  User,
  Plus,
  MessageSquare,
  ChevronDown,
  Trash2,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

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

export default function AIChatPage() {
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("HiMe Core 1.5 Pro")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      role: "assistant",
      text: "Hello Ayush. HiMe Core is synchronized and online. I can control your IoT nodes, build task automations, review computer vision event logs, or help you with semantic memories. What would you like to accomplish?",
      timestamp: "1:15 PM"
    }
  ])
  const [sessions] = useState<ChatSession[]>([
    { id: "s-1", title: "Lighting Automation", snippet: "Dim living room lights..." },
    { id: "s-2", title: "Thermostat Setpoints", snippet: "Change bedroom temperature..." },
    { id: "s-3", title: "Gate Entry Detections", snippet: "Verify known profiles..." }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: prompt,
      timestamp: timeString
    }

    setMessages((prev) => [...prev, userMsg])
    setPrompt("")
    setIsTyping(true)

    // Simulated streaming response
    setTimeout(() => {
      let reply = "I have updated your device configurations."
      const text = prompt.toLowerCase()
      if (text.includes("light") || text.includes("dim")) {
        reply = "I've dim the lights in the main zone to 30%. Cozy lighting routine is active."
      } else if (text.includes("lock") || text.includes("gate")) {
        reply = "Gate locks armed and secured. All perimeter nodes are reporting encrypted connections."
      } else if (text.includes("temp") || text.includes("warm") || text.includes("cold")) {
        reply = "HVAC thermostat registers a target temp change to 70°F. Core energy output updated."
      }

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }, 1500)
  }

  const startNewChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        text: "New conversation stream initialized. Ask me anything.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] rounded-xl overflow-hidden border border-zinc-800/40 select-none bg-zinc-950/40 backdrop-blur-xl">
      {/* Sessions Left Sidebar (Hidden on Mobile) */}
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
                  className="w-full flex items-start gap-2.5 px-2.5 py-2 hover:bg-zinc-900/50 rounded-lg text-left text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-zinc-300">{s.title}</div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{s.snippet}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/30 text-xs text-zinc-500 flex items-center justify-between">
          <span className="font-mono">Nodes: Sync</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950/20 relative">
        {/* Chat Header */}
        <div className="h-12 border-b border-zinc-800/40 px-4 md:px-6 flex items-center justify-between bg-zinc-950/40 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Assistant Console</span>
          </div>

          {/* Model selection dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Model:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-7 px-2.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 bg-zinc-900/30 flex items-center gap-1 rounded-lg">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    {model}
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </Button>
                }
              />
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300 w-44 mt-1">
                <DropdownMenuItem onClick={() => setModel("HiMe Core 1.5 Pro")} className="focus:bg-zinc-800 focus:text-zinc-100 text-xs">
                  HiMe Core 1.5 Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setModel("HiMe Vision 1.0")} className="focus:bg-zinc-800 focus:text-zinc-100 text-xs">
                  HiMe Vision 1.0 (Local)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setModel("Llama-3-8B-Instruct")} className="focus:bg-zinc-800 focus:text-zinc-100 text-xs font-mono">
                  Llama-3-8B-Instruct
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* User/AI Icons */}
                <div className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center shadow-inner ${
                  msg.role === "user"
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                    : "bg-indigo-950/20 border-indigo-500/20 text-indigo-400 animate-pulse"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div className="space-y-1 text-left">
                  <div className={`rounded-xl p-3.5 text-sm leading-relaxed border ${
                    msg.role === "user"
                      ? "bg-zinc-900/90 border-zinc-800 text-zinc-200"
                      : "bg-zinc-900/40 border-zinc-800/40 text-zinc-300"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-600 font-semibold font-mono block px-1">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mr-auto"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="rounded-xl p-3.5 bg-zinc-900/40 border border-zinc-800/40 flex items-center gap-1 h-10 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Footer */}
        <div className="p-4 md:p-6 border-t border-zinc-800/40 bg-zinc-950/40">
          <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything, e.g., 'warm up the house' or 'dim the lounge lights'..."
              className="w-full h-12 pl-4 pr-24 bg-zinc-950/90 border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 transition-all outline-none"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                disabled={!prompt.trim()}
                className="h-8 w-8 bg-zinc-200 text-zinc-950 hover:bg-white disabled:opacity-40 disabled:hover:bg-zinc-200 rounded-lg flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
