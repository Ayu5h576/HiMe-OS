import { Calendar, Clock } from "lucide-react"
import GlassCard from "@/components/glass-card"

interface AutomationEvent {
  id: string
  title: string
  time: string
  deviceCount: number
}

const upcomingEvents: AutomationEvent[] = [
  {
    id: "auto-01",
    title: "Sunset Ambient Lights On",
    time: "7:12 PM",
    deviceCount: 6
  },
  {
    id: "auto-02",
    title: "Arm Perimeter Security Lock",
    time: "10:00 PM",
    deviceCount: 4
  },
  {
    id: "auto-03",
    title: "Eco Climate Standby",
    time: "11:30 PM",
    deviceCount: 2
  }
]

export default function UpcomingAutomations() {
  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          Upcoming Agenda
        </h3>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((item) => (
          <GlassCard
            key={item.id}
            className="flex items-center justify-between p-4 border border-zinc-800/40 text-left hover:border-zinc-800 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800/60 text-zinc-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-zinc-300">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Controls {item.deviceCount} devices</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold font-mono text-zinc-400 bg-zinc-900 border border-zinc-800/50 px-2 py-0.5 rounded shadow-sm">
                {item.time}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
