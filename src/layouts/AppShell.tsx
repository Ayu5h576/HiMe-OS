import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const location = useLocation()

  // Screen size breakpoint check
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
        setIsMobileDrawerOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (isMobile) {
      setIsMobileDrawerOpen(false)
    }
  }, [location.pathname, isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen)
    } else {
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Desktop Sidebar (visible on md+) */}
      {!isMobile && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      {/* Mobile Drawer (visible on sm/mobile only, using AnimatePresence) */}
      <AnimatePresence>
        {isMobile && isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] z-50 shadow-2xl"
            >
              <Sidebar isOpen={true} setIsOpen={() => {}} className="w-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onMenuToggle={toggleSidebar} />

        {/* Dynamic Inner Outlet Wrapper */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
          <div className="h-full w-full max-w-[92rem] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
