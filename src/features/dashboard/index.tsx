import { useState } from "react"
import { motion } from "framer-motion"
import WelcomeHero from "./components/WelcomeHero"
import QuickActions from "./components/QuickActions"
import DeviceOverview from "./components/DeviceOverview"
import AIPredictor from "./components/AIPredictor"
import SystemSummary from "./components/SystemSummary"
import UpcomingAutomations from "./components/UpcomingAutomations"
import RecentConversations, { type MessageLog } from "./components/RecentConversations"

const initialLogs: MessageLog[] = [
  {
    id: "log-1",
    prompt: "Secure the perimeter and lock external doors",
    response: "Smart entrance locks engaged. Main security grid armed. Telemetry feeds online.",
    timestamp: "12:45 PM"
  },
  {
    id: "log-2",
    prompt: "Dim the living room lighting to 30%",
    response: "Adjusted Living Room dimmer to 30%. Media mood lighting active.",
    timestamp: "10:14 AM"
  }
]

export default function DashboardPage() {
  const [logs, setLogs] = useState<MessageLog[]>(initialLogs)

  const handleCommandSubmit = (command: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Custom simulated response based on command terms
    let reply = "Parameter settings successfully updated."
    const cmd = command.toLowerCase()
    
    if (cmd.includes("lock") || cmd.includes("secure")) {
      reply = "Perimeter locks verified. Security grid armed."
    } else if (cmd.includes("temp") || cmd.includes("thermostat") || cmd.includes("deg")) {
      reply = "HVAC heat pump parameters adjusted to target temperatures."
    } else if (cmd.includes("light") || cmd.includes("dim")) {
      reply = "Smart lighting dimmers set. Connected zone settings optimized."
    } else if (cmd.includes("camera") || cmd.includes("vision") || cmd.includes("feed")) {
      reply = "Camera matrix feeds brought to foreground focus."
    } else if (cmd.includes("coffee") || cmd.includes("brew")) {
      reply = "Espresso machine brewing sequence started. Cup heating active."
    }

    const newLog: MessageLog = {
      id: `log-${Date.now()}`,
      prompt: command,
      response: reply,
      timestamp: timeString
    }
    
    setLogs((prevLogs) => [newLog, ...prevLogs])
  }

  // Animation layout parent options
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column Area - Spans 2 Cols on Desktop, falls back to 1 on Tablet/Mobile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Welcome Hero & Command Input */}
          <WelcomeHero onCommandSubmit={handleCommandSubmit} />
          
          {/* Sub-grid for Action controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
            <QuickActions />
            <DeviceOverview />
          </div>

          {/* Prompt Logs Log */}
          <RecentConversations logs={logs} />
        </div>

        {/* Right Column Area - Spans 1 Col on Desktop, falls back to 1 on Mobile, splits in 2 on Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 self-start">
          
          {/* System Telemetry Summary */}
          <SystemSummary />
          
          {/* AI recommendations */}
          <AIPredictor />
          
          {/* Calendar timeline agenda */}
          <div className="md:col-span-2 lg:col-span-1">
            <UpcomingAutomations />
          </div>
        </div>

      </div>
    </motion.div>
  )
}
