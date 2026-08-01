import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Search, 
  Plus, 
  Pin, 
  Tag, 
  Sparkles,
  Trash2,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { himeApi } from '../../services/api/himeApi';
import type { MemoryNode } from '../../types';

export const AIMemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minImportance, setMinImportance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');

  // Form states for new memory
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Project Context');
  const [newContent, setNewContent] = useState('');
  const [newImportance, setNewImportance] = useState(85);
  const [newTags, setNewTags] = useState('Gemini, Memory, HiMeOS');

  const categories = ['All', 'User Preference', 'Project Context', 'Fact', 'Code Snippet', 'System Rule', 'Interaction'];

  const fetchMemories = async () => {
    setLoading(true);
    try {
      await himeApi.ensureAuthenticated();
      const list = await himeApi.getMemories('default-project-id');
      const mapped: MemoryNode[] = list.map((m) => ({
        id: m.id,
        title: m.title,
        category: (m.category as any) || 'Fact',
        content: m.content,
        importance: m.importance || 80,
        createdAt: m.createdAt || new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        connections: [],
        tags: ['HiMe', m.category],
        pinned: m.pinned ?? true,
      }));

      setMemories(mapped);
      if (mapped.length > 0 && !selectedNode) {
        setSelectedNode(mapped[0]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchMemories();
      return;
    }

    try {
      const results = await himeApi.searchMemories(query);
      if (results && results.length > 0) {
        const mapped: MemoryNode[] = results.map((r) => ({
          id: r.id,
          title: r.title,
          category: 'Fact',
          content: r.content,
          importance: Math.floor((r.score || 0.9) * 100),
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          connections: [],
          tags: ['VectorSearch', 'Match'],
          pinned: true,
        }));
        setMemories(mapped);
        setSelectedNode(mapped[0]);
      }
    } catch {
      // Fallback
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await himeApi.createMemory('default-project-id', newTitle, newCategory, newContent, newImportance);
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      fetchMemories();
    } catch (err: any) {
      alert(`Failed to save memory: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await himeApi.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (selectedNode?.id === id) {
        setSelectedNode(null);
      }
    } catch {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchImp = m.importance >= minImportance;
    return matchCat && matchImp;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <GlassCard className="p-6 space-y-4 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-purple-400/30 text-purple-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Neural Memory Store
                <span className="text-xs px-3 py-0.5 rounded-full glass border border-purple-400/40 text-purple-300 font-bold font-mono">
                  {memories.length} Active Vector Nodes
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Long-term context persistence for Gemini AI models & RAG Memory Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchMemories}
              className="p-2.5 rounded-full glass border border-white/20 text-cyan-400 hover:bg-white/10"
              title="Refresh Memory Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex glass p-1 rounded-full border border-white/10 text-xs font-mono">
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-1.5 rounded-full transition-all ${viewMode === 'graph' ? 'bg-cyan-400 text-black font-extrabold glow-cyan' : 'text-white/60 hover:text-white'}`}
              >
                2D Graph
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-1.5 rounded-full transition-all ${viewMode === 'timeline' ? 'bg-cyan-400 text-black font-extrabold glow-cyan' : 'text-white/60 hover:text-white'}`}
              >
                Timeline
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-400 transition-all glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2.5 px-4 py-2.5 glass border border-white/10 rounded-2xl">
            <Search className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Semantic vector search..."
              className="w-full bg-transparent outline-none text-white placeholder-white/40 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full glass border border-white/10 rounded-2xl px-4 py-2.5 text-white outline-none font-mono font-bold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0B0F14] text-white">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 glass border border-white/10 rounded-2xl font-mono">
            <span className="text-white/60 text-[11px] whitespace-nowrap uppercase font-bold">Imp &gt;= {minImportance}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minImportance}
              onChange={(e) => setMinImportance(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </GlassCard>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          {viewMode === 'graph' ? (
            <div className="relative w-full h-[450px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-4">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {filteredMemories.map((m, idx) => {
                  if (idx === filteredMemories.length - 1) return null;
                  const x1 = 150 + (idx * 120) % 500;
                  const y1 = 100 + (idx * 80) % 300;
                  const x2 = 150 + ((idx + 1) * 120) % 500;
                  const y2 = 100 + ((idx + 1) * 80) % 300;
                  return (
                    <line
                      key={`link-${m.id}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(168,85,247,0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="4"
                    />
                  );
                })}
              </svg>

              <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-6 p-6">
                {filteredMemories.length === 0 ? (
                  <div className="text-center font-mono text-xs text-white/40">No memories stored in backend vector index</div>
                ) : (
                  filteredMemories.map((m) => {
                    const isSelected = selectedNode?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedNode(m)}
                        className={`
                          p-4 rounded-2xl border transition-all duration-300 text-left max-w-[220px] shadow-xl group relative
                          ${isSelected 
                            ? 'bg-gradient-to-tr from-purple-900/60 via-cyan-900/40 to-black border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105' 
                            : 'bg-[#0D1219]/90 border-white/10 hover:border-purple-500/50 hover:scale-102'}
                        `}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {m.category}
                          </span>
                          {m.pinned && <Pin className="w-3 h-3 text-cyan-400 fill-cyan-400" />}
                        </div>

                        <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">{m.title}</h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{m.content}</p>

                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span>Imp: {m.importance}%</span>
                          <span className="text-cyan-400 font-bold">{m.tags.length} Tags</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedNode(m)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedNode?.id === m.id ? 'bg-purple-950/30 border-purple-500/50' : 'bg-black/40 border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{m.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">{m.category}</span>
                    </div>
                    <p className="text-xs text-gray-400">{m.content}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400">{m.importance}%</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Selected Memory Inspector Panel */}
        <GlassCard className="p-6 space-y-4 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedNode.category}
                </span>
                <button
                  onClick={() => handleDeleteMemory(selectedNode.id)}
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                  title="Delete Memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">{selectedNode.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans bg-black/40 p-3 rounded-xl border border-white/10">
                  {selectedNode.content}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Importance Score</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.importance}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400" style={{ width: `${selectedNode.importance}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500 font-mono">
              Select a node in the graph to inspect memory context.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Add New Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D1219] border border-purple-500/40 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Add New Memory Node
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1">Title / Statement</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. User prefers dark mode with cyan accents"
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none font-mono"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Memory Content</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detailed context for Gemini model reference..."
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-purple-500/50 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Importance ({newImportance}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newImportance}
                  onChange={(e) => setNewImportance(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Gemini, Memory, HiMeOS"
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-purple-500/50 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Memory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
