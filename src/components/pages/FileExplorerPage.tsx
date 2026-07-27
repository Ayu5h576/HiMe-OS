import React, { useState } from 'react';
import { 
  FolderGit2, 
  FileText, 
  Code, 
  Image as ImageIcon, 
  Music, 
  Search, 
  Star, 
  Eye, 
  Download
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { FileItem } from '../../types';

interface FileExplorerPageProps {
  files: FileItem[];
}

export const FileExplorerPage: React.FC<FileExplorerPageProps> = ({ files }) => {
  const [fileList, setFileList] = useState<FileItem[]>(files);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(files[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const typeIcons: Record<string, React.ReactNode> = {
    'document': <FileText className="w-5 h-5 text-cyan-400" />,
    'code': <Code className="w-5 h-5 text-purple-400" />,
    'image': <ImageIcon className="w-5 h-5 text-emerald-400" />,
    'audio': <Music className="w-5 h-5 text-amber-400" />
  };

  const handleToggleStar = (id: string) => {
    setFileList((prev) => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  const filteredFiles = fileList.filter((f) => {
    const matchType = filterType === 'all' || f.type === filterType;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                        f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <GlassCard className="p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-cyan-400/30 text-cyan-400">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Virtual File Explorer
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  {fileList.length} Items
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Semantic organization and cloud synchronization</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2.5 px-4 py-2.5 glass border border-white/15 rounded-2xl w-full md:w-64">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files or tags..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder-white/40"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
          {['all', 'document', 'code', 'image', 'audio'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full capitalize font-mono text-xs transition-all font-bold ${
                filterType === t 
                  ? 'bg-cyan-400 text-black font-extrabold glow-cyan' 
                  : 'glass text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Grid: Files Table & Preview Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Files List */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 rounded-3xl">
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`
                    p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4
                    ${isSelected 
                      ? 'glass border-cyan-400/60 glow-cyan' 
                      : 'glass border-white/10 hover:border-white/20'}
                  `}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="p-2.5 rounded-2xl glass border border-white/10">
                      {typeIcons[file.type] || <FileText className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{file.name}</div>
                      <div className="text-[10px] text-white/50 font-mono flex items-center gap-2">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.modified}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {file.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full glass border border-white/10 text-white/70 font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                      className="p-2 rounded-xl text-white/40 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${file.starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Preview Panel */}
        <GlassCard className="p-6 space-y-4 flex flex-col justify-between rounded-3xl">
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" /> Preview
                </span>
                <span className="text-[10px] font-mono px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold">
                  {selectedFile.isCloud ? 'Cloud Sync' : 'Local Node'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{selectedFile.name}</h3>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">{selectedFile.path}</p>
              </div>

              {selectedFile.contentPreview && (
                <div className="p-4 rounded-2xl glass border border-white/10 font-mono text-xs text-white/90 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                  {selectedFile.contentPreview}
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    const blob = new Blob([selectedFile.contentPreview || selectedFile.name], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedFile.name;
                    a.click();
                  }}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all glow-cyan"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-white/40 font-mono uppercase tracking-widest">
              Select a file to inspect preview and smart tags.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
