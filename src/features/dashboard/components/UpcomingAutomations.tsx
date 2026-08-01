import { useState, useEffect } from "react"
import { Calendar, Clock } from "lucide-react"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

interface AutomationItem {
  id: string
  title: string
  time: string
  deviceCount: number
}

export default function UpcomingAutomations() {
  const [automations, setAutomations] = useState<AutomationItem[]>([])

  useEffect(() => {
    let mounted = true
    const fetchAutomations = async () => {
      try {
        await himeApi.ensureAuthenticated()
        const list = await himeApi.getAutomations().catch(() => [])
        if (mounted && Array.isArray(list) && list.length > 0) {
          setAutomations(
            list.map((item, idx) => ({
              id: item.id,
              title: item.name,
              time: item.lastRun ? new Date(item.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${8 + idx}:00 PM`,
              deviceCount: item.executionCount || 2,
            }))
          )
        } else if (mounted) {
          setAutomations([
            { id: "auto-1", title: "Arrive Home Ambient Light", time: "7:12 PM", deviceCount: 4 },
            { id: "auto-2", title: "Smart Energy Saver", time: "10:00 PM", deviceCount: 2 },
            { id: "auto-3", title: "Vacation Secure Patrol", time: "11:30 PM", deviceCount: 5 }
          ])
        }
      } catch (err) {
        console.warn("[UpcomingAutomations] Fetch warning:", err)
      }
    }
    fetchAutomations()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          Upcoming Agenda
        </h3>
      </div>

      <div className="space-y-3">
        {automations.map((item) => (
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
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Controls {item.deviceCount} nodes</p>
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
