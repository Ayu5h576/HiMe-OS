import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, ArrowRightLeft, Sparkles, User } from "lucide-react"
import GlassCard from "@/components/glass-card"

export interface MessageLog {
  id: string
  prompt: string
  response: string
  timestamp: string
}

interface RecentConversationsProps {
  logs: MessageLog[]
}

export default function RecentConversations({ logs }: RecentConversationsProps) {
  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          Recent Commands
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono">Total logs: {logs.length}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              layout
            >
              <GlassCard className="p-4 border border-zinc-800/40 text-left space-y-3">
                {/* User Prompt Row */}
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-400 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-300 font-semibold">{log.prompt}</p>
                    <span className="text-[9px] text-zinc-600 font-semibold font-mono mt-0.5 block">{log.timestamp}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="pl-6 flex items-center text-zinc-600">
                  <ArrowRightLeft className="w-3 h-3 rotate-90" />
                </div>

                {/* AI Response Row */}
                <div className="flex items-start gap-2.5 pl-4 border-l border-indigo-500/20 bg-indigo-500/5 py-1.5 rounded">
                  <div className="p-1 rounded bg-indigo-950/20 border border-indigo-500/25 text-indigo-400 shrink-0 mt-0.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed flex-1">
                    {log.response}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
