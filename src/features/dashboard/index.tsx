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

  const handleCommandSubmit = (command: string, aiResponse?: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const reply = aiResponse || "Parameter settings successfully updated."

    const newLog: MessageLog = {
      id: `log-${Date.now()}`,
      prompt: command,
      response: reply,
      timestamp: timeString
    }
    
    setLogs((prevLogs) => [newLog, ...prevLogs])
  }

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
        
        <div className="lg:col-span-2 space-y-8">
          <WelcomeHero onCommandSubmit={handleCommandSubmit} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
            <QuickActions />
            <DeviceOverview />
          </div>

          <RecentConversations logs={logs} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 self-start">
          <SystemSummary />
          <AIPredictor />
          <div className="md:col-span-2 lg:col-span-1">
            <UpcomingAutomations />
          </div>
        </div>

      </div>
    </motion.div>
  )
}
