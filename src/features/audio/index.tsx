import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Volume2,
  Mic,
  Check,
  Plus,
  Trash2,
  Play,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

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
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [providers, setProviders] = useState<{ stt: string[]; tts: string[] }>({ stt: [], tts: [] })

  useEffect(() => {
    let mounted = true
    const loadProviders = async () => {
      try {
        await himeApi.ensureAuthenticated()
        const p = await himeApi.getVoiceProviders().catch(() => null)
        if (mounted && p) {
          setProviders({ stt: p.sttProviders || [], tts: p.ttsProviders || [] })
        }
      } catch (err) {
        console.warn("[AudioPage] Load providers error:", err)
      }
    }
    loadProviders()
    return () => { mounted = false }
  }, [])

  const handleSynthesizeText = async (text: string, id: string) => {
    setIsSynthesizing(id)
    try {
      await himeApi.ensureAuthenticated()
      await himeApi.synthesizeSpeech(text, selectedVoice).catch(() => null)
    } catch (err) {
      console.warn("[AudioPage] Synthesize error:", err)
    } finally {
      setTimeout(() => setIsSynthesizing(null), 1200)
    }
  }

  const handleToggleVoiceSession = async () => {
    try {
      await himeApi.ensureAuthenticated()
      if (activeSessionId) {
        await himeApi.endVoiceSession(activeSessionId).catch(() => null)
        setActiveSessionId(null)
      } else {
        const session = await himeApi.startVoiceSession().catch(() => null)
        if (session?.sessionId) {
          setActiveSessionId(session.sessionId)
        } else {
          setActiveSessionId(`voice-session-${Date.now()}`)
        }
      }
    } catch (err) {
      console.warn("[AudioPage] Voice session toggle error:", err)
    }
  }

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

  const voices = [
    "HiMe Natural Female",
    "HiMe Classic Male",
    "Jasper (Local Model)",
    "ElevenLabs Synthesizer"
  ]

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Audio Intelligence</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure voice synthesizer actors, microphone frequencies, and automated TTS notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  Mic Frequency Monitor
                </h3>
                <Button
                  onClick={handleToggleVoiceSession}
                  className={`h-7 px-2.5 text-[10px] font-semibold rounded-lg ${
                    activeSessionId
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {activeSessionId ? "End Voice Session" : "Start Session"}
                </Button>
              </div>

              <div className="h-28 bg-zinc-950/60 rounded-xl border border-zinc-900 flex items-end justify-center gap-1 p-3">
                {[...Array(24)].map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: activeSessionId ? [12, Math.floor(Math.random() * 90) + 10, 12] : [8, Math.floor(Math.random() * 40) + 10, 8] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className={`w-1.5 rounded-full ${activeSessionId ? "bg-red-400" : "bg-indigo-500"}`}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Wake Word Sensitivity</span>
                  <span className="font-mono font-semibold">{wakeSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wakeSensitivity}
                  onChange={(e) => setWakeSensitivity(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-400" />
                Active Voice Actor
              </h3>

              <div className="space-y-2">
                {voices.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedVoice === v
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-200"
                        : "border-zinc-800/60 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>{v}</span>
                    {selectedVoice === v && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>

              {providers.stt.length > 0 && (
                <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-900">
                  Active STT Provider: {providers.stt.join(", ")} | TTS: {providers.tts.join(", ")}
                </div>
              )}
            </GlassCard>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Automated TTS Announcements</h3>

            <div className="space-y-3">
              {announcements.map((an) => (
                <GlassCard key={an.id} className="flex items-center justify-between p-4 border border-zinc-800/40 hover:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {an.trigger}
                      </span>
                      <span className="text-[10px] text-purple-400 font-semibold font-mono">{an.voice}</span>
                    </div>
                    <p className="text-xs text-zinc-200 font-medium">{an.message}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSynthesizeText(an.message, an.id)}
                      disabled={isSynthesizing === an.id}
                      className="h-8 w-8 text-zinc-400 hover:text-purple-400 hover:bg-zinc-900"
                    >
                      {isSynthesizing === an.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(an.id)}
                      className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        <GlassCard className="p-5 border border-zinc-800/40 space-y-4 h-fit">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            New Speech Routine
          </h3>

          <form onSubmit={handleAddAnnouncement} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Trigger Event</label>
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="e.g. Front Door Motion"
                className="h-9 bg-zinc-950 border-zinc-800 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">TTS Phrase</label>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="e.g. Motion detected at the main entry point."
                className="h-9 bg-zinc-950 border-zinc-800 text-xs text-zinc-200"
              />
            </div>

            <Button
              type="submit"
              disabled={!newTrigger.trim() || !newMessage.trim()}
              className="w-full h-9 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
            >
              Add Speech Routine
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
