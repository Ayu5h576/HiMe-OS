import { useState } from "react"
import {
  Settings,
  Cpu,
  Wifi,
  User,
  Shield,
  Save,
  RefreshCw,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [brokerHost, setBrokerHost] = useState("192.168.1.100")
  const [wakeWord, setWakeWord] = useState(true)
  const [localMode, setLocalMode] = useState(false)
  const [encryption, setEncryption] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: "general", label: "General Config", icon: Settings },
    { id: "ai", label: "AI Core Models", icon: Cpu },
    { id: "network", label: "IoT Connection", icon: Wifi },
    { id: "profiles", label: "User Profiles", icon: User },
    { id: "security", label: "Firmware Safety", icon: Shield }
  ]

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1000)
  }

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">System Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure HiMe OS connection parameters, AI engine backends, and security locks.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Navigation tabs */}
        <div className="w-full md:w-56 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  isActive
                    ? "bg-zinc-900 border-zinc-800 text-white shadow-inner"
                    : "text-zinc-400 border-transparent hover:bg-zinc-900/30"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Side: Tab Contents Pane */}
        <div className="flex-1">
          <form onSubmit={handleSave}>
            <GlassCard className="p-6 border border-zinc-800/40 space-y-6">
              
              {/* GENERAL PREFERENCE SETTINGS */}
              {activeTab === "general" && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">General Parameters</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Manage wake word listeners and local network state options.</p>
                  </div>

                  {/* Wake Word toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-zinc-300">Wake Word Listening</label>
                      <p className="text-[10px] text-zinc-500">Listen for 'Hey HiMe' wake word trigger via local mic arrays.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWakeWord(!wakeWord)}
                      className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-hidden ${
                        wakeWord ? "bg-indigo-500 justify-end" : "bg-zinc-850 justify-start"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {/* Local Mode toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-zinc-300">Local-Only Processing</label>
                      <p className="text-[10px] text-zinc-500">Force offline mode. Restricts model completions to local node inference.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalMode(!localMode)}
                      className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-hidden ${
                        localMode ? "bg-indigo-500 justify-end" : "bg-zinc-850 justify-start"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              )}

              {/* AI CORE CONFIGS */}
              {activeTab === "ai" && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">AI Core Model Parameters</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Configure target endpoints and models for conversational prompts.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Dynamic Prompt Cache</label>
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40">
                        <span className="text-xs text-zinc-300">Fast Semantic Graph Cache</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-semibold">Active</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Custom LLM Endpoint</label>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        className="bg-zinc-950/40 border-zinc-800 text-xs h-9"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NETWORK NODE SETTINGS */}
              {activeTab === "network" && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">IoT Connectivity Nodes</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Configure MQTT Broker credentials for telemetry events.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">MQTT Broker Address</label>
                      <Input
                        value={brokerHost}
                        onChange={(e) => setBrokerHost(e.target.value)}
                        placeholder="E.g., 192.168.1.100..."
                        className="bg-zinc-950/40 border-zinc-800 text-xs h-9 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Broker Port</label>
                      <Input
                        placeholder="1883"
                        className="bg-zinc-950/40 border-zinc-800 text-xs h-9 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE SETTINGS */}
              {activeTab === "profiles" && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">Secure User Profiles</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Manage identities recognized by camera vision networks.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Ayush", role: "Primary Admin", email: "ayush@hime.os" },
                      { name: "Family Guest", role: "Operator", email: "guest@hime.os" }
                    ].map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-850 bg-zinc-950/40">
                        <div className="text-left space-y-0.5">
                          <h4 className="text-xs font-semibold text-zinc-200">{user.name}</h4>
                          <span className="text-[10px] text-zinc-500 block">{user.email}</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono font-semibold uppercase">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECURITY SETTINGS */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">Security & Encryption</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Configure device handshakes and firmware safety guidelines.</p>
                  </div>

                  {/* TLS handshake */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-zinc-300">Enforce TLS Handshakes</label>
                      <p className="text-[10px] text-zinc-500">Require all IoT nodes to connect using TLS 1.3 encryption certificates.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEncryption(!encryption)}
                      className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-hidden ${
                        encryption ? "bg-indigo-500 justify-end" : "bg-zinc-850 justify-start"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions footer row */}
              <div className="pt-4 border-t border-zinc-850 flex justify-end gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold h-9 px-4 text-xs rounded-lg flex items-center gap-1.5 transition-all shadow disabled:opacity-40"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : saved ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSaving ? "Saving..." : saved ? "Saved" : "Save Changes"}
                </Button>
              </div>

            </GlassCard>
          </form>
        </div>

      </div>
    </div>
  )
}
