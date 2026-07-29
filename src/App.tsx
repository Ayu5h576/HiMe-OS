import { useState, useEffect } from 'react';
import { HeaderStatusBar } from './components/common/HeaderStatusBar';
import { SidebarDock } from './components/common/SidebarDock';
import { CommandPalette } from './components/common/CommandPalette';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DesktopWidgets } from './components/common/DesktopWidgets';

import { DashboardPage } from './components/pages/DashboardPage';
import { AIAssistantPage } from './components/pages/AIAssistantPage';
import { AIMemoryPage } from './components/pages/AIMemoryPage';
import { AutomationPage } from './components/pages/AutomationPage';
import { DeviceControlPage } from './components/pages/DeviceControlPage';
import { GithubWorkspacePage } from './components/pages/GithubWorkspacePage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { FileExplorerPage } from './components/pages/FileExplorerPage';
import { CalendarTasksPage } from './components/pages/CalendarTasksPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { VisionPage } from './components/pages/VisionPage';
import { BrowserPage } from './components/pages/BrowserPage';
import { ActivityFeedPage } from './components/pages/ActivityFeedPage';

import type { 
  OSPage, 
  SystemMetrics, 
  DeviceItem, 
  GithubRepo, 
  FileItem, 
  CalendarEvent, 
  TaskItem, 
  NotificationItem 
} from './types';

import { 
  initialMetrics, 
  initialDevices, 
  initialGithubRepos, 
  initialFiles, 
  initialCalendarEvents, 
  initialTasks, 
  initialNotifications 
} from './data/mockOSData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<OSPage>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [devices] = useState<DeviceItem[]>(initialDevices);
  const [repos] = useState<GithubRepo[]>(initialGithubRepos);
  const [files] = useState<FileItem[]>(initialFiles);
  const [events] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // OS Shell UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.floor(18 + Math.random() * 10),
        ramUsageGB: Number((4.5 + Math.random() * 0.3).toFixed(1)),
        neuralLatencyMs: Math.floor(44 + Math.random() * 12)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Tasks
  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (task: TaskItem) => {
    setTasks((prev) => [task, ...prev]);
  };

  // Handlers for Notifications
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Background Ambient Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      {/* Main OS Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top OS Header Status Bar */}
        <HeaderStatusBar
          currentPage={currentPage}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)}
          unreadCount={unreadNotificationsCount}
          metrics={metrics}
          onNavigate={(p) => setCurrentPage(p)}
        />

        {/* Content Body: Sidebar + Dynamic Workspace Page */}
        <div className="flex-1 flex w-full">
          {/* Floating Glass Sidebar */}
          <SidebarDock
            currentPage={currentPage}
            onNavigate={(p) => setCurrentPage(p)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Active Workspace View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1440px] 2xl:max-w-[1536px] mx-auto w-full overflow-y-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage
                onNavigate={(p) => setCurrentPage(p)}
                onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              />
            )}

            {currentPage === 'ai-assistant' && (
              <AIAssistantPage />
            )}

            {currentPage === 'vision' && (
              <VisionPage />
            )}

            {currentPage === 'browser' && (
              <BrowserPage />
            )}

            {currentPage === 'activity' && (
              <ActivityFeedPage />
            )}

            {currentPage === 'ai-memory' && (
              <AIMemoryPage />
            )}

            {currentPage === 'automation' && (
              <AutomationPage />
            )}

            {currentPage === 'device-control' && (
              <DeviceControlPage devices={devices} />
            )}

            {currentPage === 'github' && (
              <GithubWorkspacePage repos={repos} />
            )}

            {currentPage === 'analytics' && (
              <AnalyticsPage metrics={metrics} />
            )}

            {currentPage === 'file-explorer' && (
              <FileExplorerPage files={files} />
            )}

            {currentPage === 'calendar' && (
              <CalendarTasksPage
                events={events}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsPage />
            )}
          </main>
        </div>
      </div>

      {/* Floating Glass Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(p) => setCurrentPage(p)}
      />

      {/* Slide-out Glass Notification Center */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onClearAll={handleClearNotifications}
        onNavigate={(p) => setCurrentPage(p)}
      />

      {/* Floating Desktop Widgets Overlay */}
      <DesktopWidgets metrics={metrics} onNavigate={(p) => setCurrentPage(p)} />
    </div>
  );
}
