import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, ArrowRight, Sparkles, AlertCircle, CircleDot } from "lucide-react"
import { useOS } from "@/contexts/OSContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GradientText from "@/components/gradient-text"

interface WelcomeHeroProps {
  onCommandSubmit?: (command: string) => void
}

export default function WelcomeHero({ onCommandSubmit }: WelcomeHeroProps) {
  const { isAICoreOnline } = useOS()
  const [greeting, setGreeting] = useState("Hello")
  const [prompt, setPrompt] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  // Determine greeting based on current system hour
  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) setGreeting("Good Morning")
    else if (hours < 17) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    onCommandSubmit?.(prompt)
    setPrompt("")
  }

  const handleMicClick = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate listening completion after 4 seconds
      setTimeout(() => {
        setIsRecording(false)
        onCommandSubmit?.("Simulated voice command: turn on all downstairs lights")
      }, 4000)
    }
  }

  const quickPrompts = [
    "Lock all external doors",
    "Set the bedroom thermostat to 68°F",
    "Activate away security profiles",
    "Show front gate vision feed"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel w-full rounded-2xl p-6 md:p-8 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-950/80 border border-zinc-800/40 relative overflow-hidden"
    >
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Row: Welcome & AI Core Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">HiMe OS Central</span>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
            {greeting}, <GradientText gradient="blue-purple">Ayush</GradientText>
          </h2>
        </div>

        {/* AI status badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="glass-panel flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/50">
            {isAICoreOnline ? (
              <>
                <CircleDot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-zinc-300">AI Core Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-zinc-400">AI Core Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Central Conversational Command Box */}
      <form onSubmit={handleSubmit} className="relative z-10 mb-6">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-zinc-500 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask HiMe to control devices, run routines, or answer questions..."
            className="w-full h-14 pl-12 pr-28 bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 text-base transition-all outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Pulsing microphone */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              className={`relative h-10 w-10 rounded-lg transition-all duration-300 ${
                isRecording
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Mic className="w-4 h-4" />
              {isRecording && (
                <span className="absolute inset-0 rounded-lg border border-red-500/50 animate-ping pointer-events-none" />
              )}
            </Button>

            {/* Submit Arrow */}
            <Button
              type="submit"
              disabled={!prompt.trim()}
              className="h-10 px-3 bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100 rounded-lg flex items-center justify-center font-medium gap-1"
            >
              <span className="hidden sm:inline text-xs">Run</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </form>

      {/* Voice Mode Waves indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 28 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-1 mb-4 z-10 relative overflow-hidden"
          >
            <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider mr-2">Listening</span>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                animate={{ height: [8, 18, 8] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
                className="w-0.5 bg-red-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Quick Action Chips */}
      <div className="relative z-10 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-zinc-500 font-medium font-mono mr-1">Suggestions:</span>
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(item)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 hover:bg-zinc-900/60 transition-all font-medium"
          >
            {item}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
