import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  Plus, 
  Pin, 
  Tag, 
  Sparkles,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { MemoryNode } from '../../types';

interface AIMemoryPageProps {
  memories: MemoryNode[];
  onAddMemory: (node: MemoryNode) => void;
  onDeleteMemory: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const AIMemoryPage: React.FC<AIMemoryPageProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onTogglePin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minImportance, setMinImportance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(memories[0] || null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');

  // Form states for new memory
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryNode['category']>('Project Context');
  const [newContent, setNewContent] = useState('');
  const [newImportance] = useState(85);
  const [newTags, setNewTags] = useState('Gemini, Memory, Architecture');

  const categories = ['All', 'User Preference', 'Project Context', 'Fact', 'Code Snippet', 'System Rule', 'Interaction'];

  const filteredMemories = memories.filter((m) => {
    const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchImp = m.importance >= minImportance;
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchImp && matchSearch;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNode: MemoryNode = {
      id: `mem-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      importance: newImportance,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      connections: [],
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      pinned: true
    };

    onAddMemory(newNode);
    setSelectedNode(newNode);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

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
                  {memories.length} Active Nodes
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Long-term context persistence for Gemini AI models</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
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
          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 glass border border-white/10 rounded-2xl">
            <Search className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory graph or tags..."
              className="w-full bg-transparent outline-none text-white placeholder-white/40"
            />
          </div>

          {/* Category Dropdown */}
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

          {/* Importance Slider */}
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
        {/* Interactive Memory Graph Canvas / List */}
        <GlassCard className="lg:col-span-2 p-6 min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          {viewMode === 'graph' ? (
            <div className="relative w-full h-[450px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-4">
              {/* SVG Link lines between nodes */}
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

              {/* Node Bubbles Floating */}
              <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-6 p-6">
                {filteredMemories.map((m) => {
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
                })}
              </div>
            </div>
          ) : (
            /* Timeline List View */
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePin(selectedNode.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    title="Toggle Pin"
                  >
                    <Pin className={`w-4 h-4 ${selectedNode.pinned ? 'text-cyan-400 fill-cyan-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => { onDeleteMemory(selectedNode.id); setSelectedNode(null); }}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

                <div className="pt-2">
                  <span className="text-[10px] text-gray-500 block mb-1">ASSOCIATED TAGS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500">
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
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none font-mono"
                >
                  <option value="User Preference">User Preference</option>
                  <option value="Project Context">Project Context</option>
                  <option value="Fact">Fact</option>
                  <option value="Code Snippet">Code Snippet</option>
                  <option value="System Rule">System Rule</option>
                  <option value="Interaction">Interaction</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Memory Context Content</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detailed context for Gemini model reference..."
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-purple-500/50 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white outline-none"
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
