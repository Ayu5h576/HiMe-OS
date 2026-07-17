import { useState } from "react"
import { Sparkles, Check, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import GlassCard from "@/components/glass-card"
import { Button } from "@/components/ui/button"

interface Suggestion {
  id: string
  title: string
  reason: string
  actionLabel: string
}

const initialSuggestions: Suggestion[] = [
  {
    id: "sug-01",
    title: "Optimize Living Room HVAC",
    reason: "No motion detected for 45 mins. lowering HVAC to ECO mode saves 14% energy.",
    actionLabel: "Set ECO Mode"
  },
  {
    id: "sug-02",
    title: "Brew Morning Espresso",
    reason: "Based on your wake pattern, espresso machine is ready. Water preheated.",
    actionLabel: "Start Brewing"
  },
  {
    id: "sug-03",
    title: "Preheat Driveway De-icer",
    reason: "Local forecast predicts freezing rain in 3 hours. Enable pre-heating?",
    actionLabel: "Turn On"
  }
]

export default function AIPredictor() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)

  const handleDismiss = (id: string) => {
    setSuggestions(suggestions.filter((item) => item.id !== id))
  }

  const handleAccept = (id: string) => {
    // Action trigger simulation
    setSuggestions(suggestions.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          AI Recommendations
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono">Real-time</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {suggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-6 rounded-xl border border-zinc-800/40 text-center text-zinc-500 text-xs py-10"
            >
              All suggestions processed. Check back later!
            </motion.div>
          ) : (
            suggestions.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                layout
              >
                <GlassCard className="p-4 border border-zinc-800/40 text-left relative group">
                  {/* Action items header */}
                  <h4 className="text-sm font-semibold text-zinc-200">{item.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-medium">
                    {item.reason}
                  </p>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDismiss(item.id)}
                      className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleAccept(item.id)}
                      className="h-7 px-3 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded font-semibold transition-all flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {item.actionLabel}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
