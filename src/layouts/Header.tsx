import { useState, useEffect } from "react"
import { Menu, Search, Bell, Wifi, Cpu, Command } from "lucide-react"
import { useOS } from "@/contexts/OSContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { isAICoreOnline, connectedNodesCount } = useOS()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-zinc-950/40 backdrop-blur-xl border-b border-zinc-800/40 select-none">
      {/* Left Menu Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-zinc-200"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Brand Indicator / Title */}
        <div className="hidden md:flex items-center gap-2">
          <span className="font-semibold text-base tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            HiMe OS
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">v1.0.0</span>
        </div>
      </div>

      {/* Center Spotlight Search Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <Input
            placeholder="Search dashboard or run command..."
            className="w-full h-9 pl-9 pr-12 bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-zinc-800 focus:bg-zinc-950 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 transition-all outline-none"
          />
          <div className="absolute right-3 top-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/90 text-[10px] text-zinc-500 font-mono shadow-sm pointer-events-none">
            <Command className="w-2.5 h-2.5 mr-0.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-zinc-500 mr-2 border-r border-zinc-800/60 pr-4">
          <div className="flex items-center gap-1.5">
            <Wifi className={`w-3.5 h-3.5 ${isAICoreOnline ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
            <span className="text-zinc-400 font-medium">
              {isAICoreOnline ? 'Core Online' : 'Core Offline'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-400 font-medium">{connectedNodesCount} Nodes Connected</span>
          </div>
        </div>

        {/* Date and Ticking Clock */}
        <div className="hidden sm:flex flex-col items-end text-right mr-1">
          <span className="text-xs text-zinc-300 font-semibold font-mono tracking-wide">{formattedTime}</span>
          <span className="text-[10px] text-zinc-500 font-medium">{formattedDate}</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 rounded-lg"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-indigo-500" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-200 mt-1">
            <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="py-1">
              <div className="px-4 py-2 hover:bg-zinc-800/40 transition-colors cursor-pointer">
                <p className="text-xs font-semibold text-zinc-300">IoT Automation Triggered</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Living room heater adjusted by AI Core</p>
              </div>
              <div className="px-4 py-2 hover:bg-zinc-800/40 transition-colors cursor-pointer">
                <p className="text-xs font-semibold text-zinc-300">Vision Inference Completed</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Known profile 'Ayush' detected at main gate</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-zinc-800">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-zinc-200">Ayush</p>
                <p className="text-xs leading-none text-zinc-500">ayush@hime.os</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              User Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              System Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-red-400 focus:bg-red-950/20 focus:text-red-400">
              Lock Frame
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
