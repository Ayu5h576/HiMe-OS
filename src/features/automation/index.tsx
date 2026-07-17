import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GitFork,
  Plus,
  Trash2,
  Sliders,
  Clock,
  Sparkles,
  Check,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import GlassCard from "@/components/glass-card"

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

  // Trigger Block state
  const [selectedTrigger, setSelectedTrigger] = useState("Time of Day")
  const [selectedAction, setSelectedAction] = useState("Run Scene: Home")

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

  const handleCreate = () => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: `Custom Rule Triggered by ${selectedTrigger}`,
      trigger: `${selectedTrigger} trigger configured`,
      action: selectedAction,
      isActive: true
    }
    setRules([...rules, newRule])
  }

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Automation Rule Builder</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure logic paths, timers, and active voice triggers for smart home interactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Area (Spans 2 columns): Interactive visual builder */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border border-zinc-800/40 space-y-6 relative overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Logic Node Designer
            </h3>

            {/* Visual Builder Diagram blocks */}
            <div className="space-y-4">
              
              {/* TRIGGER IF BLOCK */}
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
                  <Clock className="w-4 h-4 text-zinc-600 mr-1" />
                </div>
              </div>

              {/* Vertical connector line */}
              <div className="h-6 w-0.5 bg-zinc-800 ml-6" />

              {/* ACTION THEN BLOCK */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 font-bold text-xs text-purple-400 font-mono">
                  THEN
                </div>
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-zinc-500 font-medium font-mono block uppercase text-[10px]">Perform action</span>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="bg-transparent border-0 text-zinc-300 font-semibold focus:ring-0 outline-none text-sm cursor-pointer mt-0.5"
                    >
                      <option className="bg-zinc-900" value="Run Scene: Home">Run Preset: Arrive Home</option>
                      <option className="bg-zinc-900" value="Lock Security Core">Lock all security doors</option>
                      <option className="bg-zinc-900" value="Adjust climate to ECO">Configure thermostat to ECO temperature</option>
                      <option className="bg-zinc-900" value="Mute announcements">Mute speaker announcements</option>
                    </select>
                  </div>
                  <Sparkles className="w-4 h-4 text-zinc-600 mr-1" />
                </div>
              </div>

            </div>

            {/* Create Trigger button */}
            <div className="pt-4 border-t border-zinc-850 flex justify-end">
              <Button
                onClick={handleCreate}
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold h-9 px-4 text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
              >
                <Plus className="w-4 h-4" />
                Save Automation
              </Button>
            </div>
          </GlassCard>

          {/* Active Rules List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Active Routines ({rules.length})</h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {rules.map((rule) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    layout
                  >
                    <GlassCard className="p-4 border border-zinc-800/40 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded bg-zinc-900 border border-zinc-800/50 mt-0.5 ${rule.isActive ? 'text-indigo-400' : 'text-zinc-600'}`}>
                          <GitFork className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-sm text-zinc-200">{rule.name}</h4>
                          <div className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider flex items-center gap-2">
                            <span>IF: {rule.trigger}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                            <span>THEN: {rule.action}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rule controls: Toggle switch & Delete */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-hidden ${
                            rule.isActive ? "bg-indigo-500 justify-end" : "bg-zinc-850 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
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

        {/* Right Sidebar Area: Blueprints block templates list */}
        <div className="space-y-6">
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Blueprint Blueprints
            </h3>
            
            <div className="space-y-4">
              {blueprintTemplates.map((bp) => (
                <div key={bp.id} className="text-xs text-left space-y-1.5 border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    {bp.title}
                  </h4>
                  <p className="text-zinc-500 font-medium leading-relaxed">{bp.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
