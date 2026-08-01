import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GitFork,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Play,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  isActive: boolean
}

const blueprintTemplates = [
  { id: "bp-1", title: "Arrive Home Ambient Light", desc: "Turns on foyer lights when front door is unlocked between sunset and sunrise." },
  { id: "bp-2", title: "Smart Energy Saver", desc: "Dims heating/cooling thermostat if no occupancy is detected in any zone for 1 hour." },
  { id: "bp-3", title: "Vacation Secure Patrol", desc: "Randomizes smart plugs and lighting sequences while away to simulate occupancy." }
]

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: "rule-1", name: "Security lock active at 10 PM", trigger: "Time is 10:00 PM daily", action: "Engage front door lock & arm cameras", isActive: true },
    { id: "rule-2", name: "ECO Climate when unoccupied", trigger: "No presence for 45 mins", action: "Configure thermostat to 66°F", isActive: true },
    { id: "rule-3", name: "Welcome back foyer light", trigger: "Front entrance door unlocked", action: "Enable main hallway lighting", isActive: false }
  ])
  const [selectedTrigger, setSelectedTrigger] = useState("Time of Day")
  const [selectedAction, setSelectedAction] = useState("Run Scene: Home")
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchRules = async () => {
      setIsLoading(true)
      try {
        await himeApi.ensureAuthenticated()
        const apiRules = await himeApi.getAutomations().catch(() => [])
        if (mounted && Array.isArray(apiRules) && apiRules.length > 0) {
          setRules(
            apiRules.map((r) => ({
              id: r.id,
              name: r.name,
              trigger: "Configured Trigger Event",
              action: r.description || "Execute Target Action",
              isActive: r.enabled
            }))
          )
        }
      } catch (err) {
        console.warn("[AutomationPage] Fetch error:", err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchRules()
    return () => { mounted = false }
  }, [])

  const handleToggle = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    )
  }

  const handleDelete = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const handleCreate = async () => {
    const ruleName = `Custom Rule: ${selectedTrigger}`
    try {
      await himeApi.ensureAuthenticated()
      const created = await himeApi.createAutomation(undefined, ruleName, "SCHEDULED", "CREATE_TASK").catch(() => null)
      if (created) {
        setRules((prev) => [
          {
            id: created.id,
            name: created.name,
            trigger: selectedTrigger,
            action: selectedAction,
            isActive: created.enabled
          },
          ...prev
        ])
        return
      }
    } catch (err) {
      console.warn("[AutomationPage] Create automation error:", err)
    }

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      trigger: selectedTrigger,
      action: selectedAction,
      isActive: true
    }
    setRules([...rules, newRule])
  }

  const handleRunAutomation = async (ruleId: string) => {
    setIsExecuting(ruleId)
    try {
      await himeApi.ensureAuthenticated()
      await himeApi.runAutomation(ruleId).catch(() => null)
    } catch (err) {
      console.warn("[AutomationPage] Run error:", err)
    } finally {
      setTimeout(() => setIsExecuting(null), 1000)
    }
  }

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Automation Rule Builder</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure logic paths, timers, and active voice triggers for smart home interactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border border-zinc-800/40 space-y-6 relative overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Logic Node Designer
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 font-bold text-xs text-blue-400 font-mono">
                  IF
                </div>
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-zinc-500 font-medium font-mono block uppercase text-[10px]">Select trigger</span>
                    <select
                      value={selectedTrigger}
                      onChange={(e) => setSelectedTrigger(e.target.value)}
                      className="bg-transparent border-0 text-zinc-300 font-semibold focus:ring-0 outline-none text-sm cursor-pointer mt-0.5"
                    >
                      <option className="bg-zinc-900" value="Time of Day">Time is 10:00 PM</option>
                      <option className="bg-zinc-900" value="Presence Event">Foyer sensor detects motion</option>
                      <option className="bg-zinc-900" value="Camera Inference">Front Gate camera matches 'Ayush'</option>
                      <option className="bg-zinc-900" value="Voice Trigger">Wake word 'Good Night' parsed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-zinc-800" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 font-bold text-xs text-purple-400 font-mono">
                  THEN
                </div>
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-zinc-500 font-medium font-mono block uppercase text-[10px]">Select action</span>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="bg-transparent border-0 text-zinc-300 font-semibold focus:ring-0 outline-none text-sm cursor-pointer mt-0.5"
                    >
                      <option className="bg-zinc-900" value="Run Scene: Home">Lock all external doors & arm security</option>
                      <option className="bg-zinc-900" value="Climate Setpoint">Set thermostat target to 68°F</option>
                      <option className="bg-zinc-900" value="Dim Lighting">Set main hallway lighting to 30%</option>
                      <option className="bg-zinc-900" value="Execute Script">Run Espresso Pre-heat Sequence</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/40 flex justify-end">
              <Button
                onClick={handleCreate}
                className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10"
              >
                <Plus className="w-4 h-4" />
                Commit Automation Rule
              </Button>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Active Rule Set ({rules.length})</h3>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 p-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Loading rules from automation engine...</span>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {rules.map((rule) => (
                  <motion.div
                    key={rule.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GlassCard className="flex items-center justify-between p-4 border border-zinc-800/40 hover:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            rule.isActive ? "bg-emerald-500" : "bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              rule.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <div>
                          <h4 className="font-semibold text-xs text-zinc-200">{rule.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                            {rule.trigger} → {rule.action}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRunAutomation(rule.id)}
                          disabled={isExecuting === rule.id}
                          className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900"
                        >
                          {isExecuting === rule.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          className="h-7 w-7 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Blueprint Presets
          </h3>

          <div className="space-y-3">
            {blueprintTemplates.map((bp) => (
              <GlassCard key={bp.id} className="p-4 border border-zinc-800/40 text-left space-y-2 hover:border-zinc-800">
                <h4 className="font-semibold text-xs text-zinc-200">{bp.title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{bp.desc}</p>
                <Button
                  onClick={() => {
                    setSelectedTrigger(bp.title)
                    setSelectedAction(bp.desc)
                  }}
                  variant="ghost"
                  className="h-7 px-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold p-0 flex items-center gap-1"
                >
                  Use Blueprint
                  <GitFork className="w-3 h-3" />
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
