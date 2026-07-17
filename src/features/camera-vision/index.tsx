import { useState } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  Video,
  Circle,
  Maximize2,
  VolumeX,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import GlassCard from "@/components/glass-card"

interface CameraFeed {
  id: string
  name: string
  location: string
  status: "active" | "inactive"
  detections: string[]
}

interface VisionEvent {
  id: string
  cameraName: string
  event: string
  confidence: number
  time: string
  severity: "info" | "warning"
}

export default function CameraVisionPage() {
  const [selectedFeedId, setSelectedFeedId] = useState("feed-1")
  const [isLive] = useState(true)

  const feeds: CameraFeed[] = [
    { id: "feed-1", name: "Front Gate Driveway", location: "Outside", status: "active", detections: ["Person (Ayush) 98%"] },
    { id: "feed-2", name: "Backyard Perimeter", location: "Outside", status: "active", detections: ["None"] },
    { id: "feed-3", name: "Garage Internal Door", location: "Garage", status: "active", detections: ["Vehicle 95%"] },
    { id: "feed-4", name: "Living Room Foyer", location: "Indoor", status: "active", detections: ["None"] }
  ]

  const events: VisionEvent[] = [
    { id: "e-1", cameraName: "Front Gate Driveway", event: "Profile match verified: Ayush", confidence: 98, time: "12:45 PM", severity: "info" },
    { id: "e-2", cameraName: "Front Gate Driveway", event: "Package delivery detected", confidence: 91, time: "11:02 AM", severity: "info" },
    { id: "e-3", cameraName: "Garage Internal Door", event: "Garage Door left OPEN warning", confidence: 100, time: "9:15 AM", severity: "warning" },
    { id: "e-4", cameraName: "Backyard Perimeter", event: "Unknown animal detected (Raccoon)", confidence: 85, time: "4:30 AM", severity: "info" }
  ]

  const activeFeed = feeds.find((f) => f.id === selectedFeedId) || feeds[0]

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Computer Vision Stream</h1>
        <p className="text-sm text-zinc-400 mt-1">Real-time surveillance feeds, neural object bounding logs, and threat alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Spans 2 columns): Video Feed Canvas and Camera grid */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-4 border border-zinc-800/40 relative overflow-hidden bg-black/60">
            {/* Feed Metadata header overlay */}
            <div className="flex items-center justify-between mb-3.5 px-1.5 z-10 relative">
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-ping" />
                <span className="text-xs font-semibold text-zinc-200">{activeFeed.name}</span>
                <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                  {activeFeed.location}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
                  <VolumeX className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Custom simulated video output with detection boxes */}
            <div className="relative aspect-video w-full rounded-lg bg-zinc-950 border border-zinc-900 overflow-hidden flex items-center justify-center">
              {/* Scanline visual overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/10 to-transparent pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 4px, 6px 100%" }} />

              {/* Simulated object bounding box */}
              {activeFeed.id === "feed-1" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1/4 left-1/3 w-36 h-48 border border-emerald-500 bg-emerald-500/5 rounded p-1.5 flex flex-col justify-between"
                >
                  <span className="text-[8px] bg-emerald-500 text-black font-semibold font-mono px-1 rounded self-start">
                    Person: 98%
                  </span>
                  <span className="text-[9px] text-emerald-300 font-bold font-mono self-end">
                    Ayush
                  </span>
                </motion.div>
              )}

              {/* Garage Vehicle box */}
              {activeFeed.id === "feed-3" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-1/4 right-1/4 w-44 h-32 border border-blue-500 bg-blue-500/5 rounded p-1.5 flex flex-col justify-between"
                >
                  <span className="text-[8px] bg-blue-500 text-white font-semibold font-mono px-1 rounded self-start">
                    Vehicle: 95%
                  </span>
                </motion.div>
              )}

              {/* Offline noise simulation helper */}
              {!isLive && (
                <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              )}

              {/* Detections sidebar logs */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                {activeFeed.detections.map((det, idx) => (
                  <span key={idx} className="text-[10px] bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-semibold font-mono px-2 py-0.5 rounded shadow-lg backdrop-blur">
                    {det}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Camera switcher grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {feeds.map((feed) => (
              <button
                key={feed.id}
                onClick={() => setSelectedFeedId(feed.id)}
                className={`glass-panel p-3.5 rounded-xl text-left border transition-all duration-300 ${
                  selectedFeedId === feed.id
                    ? "border-zinc-700 bg-zinc-900/60"
                    : "border-zinc-800/40 hover:border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Video className={`w-4 h-4 ${selectedFeedId === feed.id ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full ${feed.status === "active" ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </div>
                <h4 className="font-semibold text-xs text-zinc-300 truncate">{feed.name}</h4>
                <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block uppercase">{feed.location}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Sidebar Area: Event Alerts feed */}
        <div className="space-y-6">
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" />
              Vision Alerts
            </h3>
            
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {events.map((e) => (
                <div key={e.id} className="text-xs text-left space-y-1.5 border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold font-mono text-[9px] text-zinc-500">{e.cameraName}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{e.time}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    {e.severity === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-zinc-300">{e.event}</p>
                      <span className="text-[9px] text-zinc-500 font-semibold font-mono">Confidence: {e.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
