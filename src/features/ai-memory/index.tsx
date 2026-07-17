import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Bookmark,
  Sparkles,
  Layers,
  Heart,
  ChevronRight,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"

interface MemoryNode {
  id: string
  category: "preference" | "profile" | "routine" | "habit"
  content: string
  confidence: number
}

const initialMemories: MemoryNode[] = [
  { id: "mem-1", category: "preference", content: "Ayush prefers the living room thermostat set at 71°F in the afternoon.", confidence: 98 },
  { id: "mem-2", category: "profile", content: "Ayush is designated as primary Homeowner with full Admin privileges.", confidence: 100 },
  { id: "mem-3", category: "routine", content: "Driveway de-icers preheat automatically when local rain forecast is true.", confidence: 91 },
  { id: "mem-4", category: "habit", content: "Typically arms security perimeter guard locks around 10:00 PM.", confidence: 95 },
  { id: "mem-5", category: "preference", content: "Main hallway dimmers set to 30% when cozy routine triggers.", confidence: 88 }
]

export default function AIMemoryPage() {
  const [memories, setMemories] = useState<MemoryNode[]>(initialMemories)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [newMemoryText, setNewMemoryText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMemories = memories.filter((mem) => {
    const matchesFilter = categoryFilter === "all" || mem.category === categoryFilter
    const matchesSearch = mem.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDelete = (id: string) => {
    setMemories(memories.filter((mem) => mem.id !== id))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemoryText.trim()) return

    const newNode: MemoryNode = {
      id: `mem-${Date.now()}`,
      category: "preference",
      content: newMemoryText,
      confidence: 90
    }

    setMemories([newNode, ...memories])
    setNewMemoryText("")
  }

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">AI Semantic Memory</h1>
          <p className="text-sm text-zinc-400 mt-1">Review, prune, and modify persistent environmental context and profile preferences.</p>
        </div>

        {/* Global info metrics */}
        <div className="flex items-center gap-2">
          <div className="glass-panel flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/40">
            <Layers className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-zinc-300">{memories.length} Core Nodes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area (Spans 2 columns): Search, filter, and Memory Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-900">
            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: "all", label: "All Graph" },
                { id: "preference", label: "Prefs" },
                { id: "profile", label: "Users" },
                { id: "routine", label: "Routines" },
                { id: "habit", label: "Patterns" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border border-transparent ${
                    categoryFilter === tab.id
                      ? "bg-zinc-900 border-zinc-800/80 text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search memories */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search semantic nodes..."
                className="w-full h-8 pl-8 bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-800 text-xs rounded-lg"
              />
            </div>
          </div>

          {/* List of cards */}
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filteredMemories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel p-10 rounded-xl text-center text-zinc-500 text-xs py-14"
                >
                  No semantic nodes found.
                </motion.div>
              ) : (
                filteredMemories.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    layout
                  >
                    <GlassCard className="p-4 border border-zinc-800/40 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {/* Categorised symbol icons */}
                        <div className={`p-2 rounded bg-zinc-900 border border-zinc-800/50 mt-0.5 shrink-0 ${
                          item.category === "preference" && "text-pink-400",
                          item.category === "profile" && "text-blue-400",
                          item.category === "routine" && "text-indigo-400",
                          item.category === "habit" && "text-yellow-400"
                        }`}>
                          {item.category === "preference" && <Heart className="w-4 h-4" />}
                          {item.category === "profile" && <Bookmark className="w-4 h-4" />}
                          {item.category === "routine" && <Sparkles className="w-4 h-4" />}
                          {item.category === "habit" && <Brain className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-zinc-300 font-semibold leading-relaxed">{item.content}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold font-mono">
                            <span className="uppercase tracking-wider">{item.category}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                            <span>Confidence: {item.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar Area: Manual Entry form & Semantic stats */}
        <div className="space-y-6">
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Semantic Node
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Memory Content</span>
                <textarea
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder="E.g., Ayush prefers coffee preheated at 8:00 AM..."
                  rows={4}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-700 outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!newMemoryText.trim()}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold py-2 rounded-lg text-xs transition-all shadow disabled:opacity-40"
              >
                Inject Node Memory
              </Button>
            </form>
          </GlassCard>

          {/* Graph telemetry explanation */}
          <GlassCard className="p-5 border border-zinc-800/40 space-y-3.5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Graph Vectors
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Memories are parsed contextually from active user chats and telemetry rules. High confidence nodes are stored in the semantic graph db to ground model prompts.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
