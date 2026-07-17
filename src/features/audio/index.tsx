import { useState } from "react"
import { motion } from "framer-motion"
import {
  Volume2,
  Mic,
  Check,
  Music,
  Plus,
  Trash2,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"

interface Announcement {
  id: string
  trigger: string
  message: string
  voice: string
}

export default function AudioPage() {
  const [wakeSensitivity, setWakeSensitivity] = useState(80)
  const [selectedVoice, setSelectedVoice] = useState("HiMe Natural Female")
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "an-1", trigger: "Front Gate Detections", message: "A visitor is approaching the front gate.", voice: "HiMe Natural Female" },
    { id: "an-2", trigger: "Security Alarm Tripped", message: "Alert. Secure Mode has been compromised.", voice: "HiMe Core Alert System" }
  ])
  const [newTrigger, setNewTrigger] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const voices = [
    "HiMe Natural Female",
    "HiMe Classic Male",
    "Jasper (Local Model)",
    "ElevenLabs Synthesizer"
  ]

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTrigger.trim() || !newMessage.trim()) return

    const newAn: Announcement = {
      id: `an-${Date.now()}`,
      trigger: newTrigger,
      message: newMessage,
      voice: selectedVoice
    }

    setAnnouncements([...announcements, newAn])
    setNewTrigger("")
    setNewMessage("")
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((an) => an.id !== id))
  }

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Audio Intelligence</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure voice synthesizer actors, microphone frequencies, and automated TTS notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Spans 2 columns): Microphones frequency arrays & Synthesizers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mic array visual frequencies */}
            <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-400" />
                Mic Frequency Monitor
              </h3>

              {/* Animated visualizer */}
              <div className="h-28 bg-zinc-950/60 rounded-xl border border-zinc-900 flex items-end justify-center gap-1 p-3">
                {[...Array(24)].map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: [8, Math.floor(Math.random() * 80) + 12, 8] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="w-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>

              {/* Wake Word sensitivity slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Wake Word Sensitivity</span>
                  <span className="font-mono font-semibold">{wakeSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={wakeSensitivity}
                  onChange={(e) => setWakeSensitivity(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </GlassCard>

            {/* TTS Voice Selectors */}
            <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                Speech Synthesis Voice
              </h3>

              <div className="space-y-2">
                {voices.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      selectedVoice === v
                        ? "bg-zinc-900 border-zinc-800 text-white shadow-inner"
                        : "text-zinc-400 border-transparent hover:bg-zinc-900/30"
                    }`}
                  >
                    <span>{v}</span>
                    {selectedVoice === v && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </GlassCard>

          </div>

          {/* Voice Announcements scheduler rules list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">TTS Alert Rules</h3>
            <div className="space-y-3">
              {announcements.map((an) => (
                <GlassCard key={an.id} className="p-4 border border-zinc-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800/50 mt-0.5 text-zinc-500 shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-300">On Trigger: {an.trigger}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">" {an.message} "</p>
                      <span className="text-[9px] text-zinc-500 font-semibold font-mono uppercase mt-0.5 block">Voice: {an.voice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(an.id)}
                      className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Area: Add TTS Alert Rule form */}
        <div className="space-y-6">
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add TTS Alert
            </h3>
            
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">System Trigger event</span>
                <Input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="E.g., Garage Door Opened..."
                  className="w-full bg-zinc-950/40 border-zinc-800 text-xs h-9 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Announcement Message</span>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="E.g., Garage Door is now open..."
                  className="w-full bg-zinc-950/40 border-zinc-800 text-xs h-9 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={!newTrigger.trim() || !newMessage.trim()}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold py-2 rounded-lg text-xs transition-all shadow disabled:opacity-40"
              >
                Create Alert Rule
              </Button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
