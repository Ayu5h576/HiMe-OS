import React, { lazy, Suspense } from "react"
import { createHashRouter, Navigate } from "react-router-dom"
import AppShell from "@/layouts/AppShell"

// Lazy loaded page feature skeletons
const DashboardPage = lazy(() => import("@/features/dashboard"))
const AIChatPage = lazy(() => import("@/features/ai-chat"))
const DevicesPage = lazy(() => import("@/features/devices"))
const DeviceDetailsPage = lazy(() => import("@/features/devices/details"))
const DeviceControlPage = lazy(() => import("@/features/devices/control"))
const AutomationPage = lazy(() => import("@/features/automation"))
const AIMemoryPage = lazy(() => import("@/features/ai-memory"))
const CameraVisionPage = lazy(() => import("@/features/camera-vision"))
const AudioPage = lazy(() => import("@/features/audio"))
const AnalyticsPage = lazy(() => import("@/features/analytics"))
const SettingsPage = lazy(() => import("@/features/settings"))

// Premium minimalist loading indicator matching the design system
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[300px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-300 rounded-full animate-spin" />
      <span className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider uppercase">Loading Module</span>
    </div>
  </div>
)

// Helper wrapper to enforce lazy loaded suspense bounds
const renderLazy = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: renderLazy(DashboardPage) },
      { path: "ai-chat", element: renderLazy(AIChatPage) },
      { path: "devices", element: renderLazy(DevicesPage) },
      { path: "devices/:deviceId", element: renderLazy(DeviceDetailsPage) },
      { path: "devices/:deviceId/control", element: renderLazy(DeviceControlPage) },
      { path: "automation", element: renderLazy(AutomationPage) },
      { path: "ai-memory", element: renderLazy(AIMemoryPage) },
      { path: "camera-vision", element: renderLazy(CameraVisionPage) },
      { path: "audio", element: renderLazy(AudioPage) },
      { path: "analytics", element: renderLazy(AnalyticsPage) },
      { path: "settings", element: renderLazy(SettingsPage) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
