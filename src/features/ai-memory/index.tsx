import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Bookmark,
  Sparkles,
  Layers,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GlassCard from "@/components/glass-card"
import { himeApi } from "@/services/api/himeApi"

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
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchMemories = async () => {
      setIsLoading(true)
      try {
        await himeApi.ensureAuthenticated()
        const backendMems = await himeApi.getMemories().catch(() => [])
        if (mounted && Array.isArray(backendMems) && backendMems.length > 0) {
          const mapped: MemoryNode[] = backendMems.map((m) => ({
            id: m.id,
            category: (m.category?.toLowerCase() as any) || "preference",
            content: m.content || m.title,
            confidence: m.importance || 90
          }))
          setMemories(mapped)
        }
      } catch (err) {
        console.warn("[AIMemoryPage] Load error:", err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchMemories()
    return () => { mounted = false }
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) return
    setIsSearching(true)
    try {
      await himeApi.ensureAuthenticated()
      const searchResults = await himeApi.searchMemories(query).catch(() => [])
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        const mapped: MemoryNode[] = searchResults.map((m) => ({
          id: m.id,
          category: "preference",
          content: m.content || m.title,
          confidence: Math.round((m.score || 0.9) * 100)
        }))
        setMemories(mapped)
      }
    } catch (err) {
      console.warn("[AIMemoryPage] Vector search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await himeApi.ensureAuthenticated()
      await himeApi.deleteMemory(id).catch(() => null)
      setMemories((prev) => prev.filter((mem) => mem.id !== id))
    } catch (err) {
      console.warn("[AIMemoryPage] Delete error:", err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemoryText.trim()) return

    const content = newMemoryText
    setNewMemoryText("")

    try {
      await himeApi.ensureAuthenticated()
      const created = await himeApi.createMemory(undefined, "Semantic Fact", "PREFERENCE", content, 95).catch(() => null)
      if (created) {
        setMemories((prev) => [
          {
            id: created.id,
            category: "preference",
            content: created.content || content,
            confidence: 95
          },
          ...prev
        ])
        return
      }
    } catch (err) {
      console.warn("[AIMemoryPage] Create memory error:", err)
    }

    const newNode: MemoryNode = {
      id: `mem-${Date.now()}`,
      category: "preference",
      content,
      confidence: 90
    }
    setMemories([newNode, ...memories])
  }

  const filteredMemories = memories.filter((mem) => {
    const matchesFilter = categoryFilter === "all" || mem.category === categoryFilter
    const matchesSearch = mem.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6 select-none text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">AI Semantic Memory</h1>
          <p className="text-sm text-zinc-400 mt-1">Review, prune, and modify persistent environmental context and profile preferences.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="glass-panel flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/40">
            <Layers className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-zinc-300">{memories.length} Core Nodes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-900">
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
                      ? "bg-zinc-900/90 text-white border-zinc-800/50 shadow-inner"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              {isSearching ? (
                <Loader2 className="absolute left-2.5 top-2 w-3.5 h-3.5 text-indigo-400 animate-spin" />
              ) : (
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
              )}
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Vector RAG search..."
                className="w-full h-8 pl-8 text-xs bg-zinc-900/40 border-zinc-800/60 focus:bg-zinc-950 focus:border-indigo-500/80 rounded-lg"
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Fetching pgvector RAG memory entries...</span>
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredMemories.map((mem) => (
                <motion.div
                  key={mem.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="flex items-start justify-between p-4 border border-zinc-800/40 hover:border-zinc-800 group">
                    <div className="flex items-start gap-3 min-w-0 pr-4">
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800/50 text-indigo-400 shrink-0 mt-0.5">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800/50">
                            {mem.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {mem.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed mt-2">
                          {mem.content}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(mem.id)}
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-5 border border-zinc-800/40 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Store Manual Fact
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <textarea
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="Enter context, user preferences, or habits to store in RAG memory matrix..."
                className="w-full h-24 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/80 outline-none resize-none"
              />
              <Button
                type="submit"
                disabled={!newMemoryText.trim()}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Index into Vector Store
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="p-5 border border-zinc-800/40 space-y-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold font-mono uppercase text-[10px]">
              <Bookmark className="w-3.5 h-3.5 text-blue-400" />
              Memory Management Policy
            </div>
            <p className="leading-relaxed">
              Memories are automatically embedded with <span className="text-zinc-200 font-mono">pgvector</span> vectors and injected into AI Assistant prompt context during active user interactions.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
