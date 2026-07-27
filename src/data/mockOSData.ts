import type { 
  MemoryNode, 
  AutomationWorkflow, 
  DeviceItem, 
  GithubRepo, 
  FileItem, 
  CalendarEvent, 
  TaskItem, 
  NotificationItem,
  SystemMetrics
} from '../types';

export const initialMetrics: SystemMetrics = {
  cpuUsage: 22,
  ramUsageGB: 4.6,
  ramTotalGB: 32,
  aiModel: 'gemini-3.6-flash',
  neuralLatencyMs: 48,
  activeThreads: 18,
  memoryNodesCount: 1284,
  automationsActive: 8,
  connectedDevicesCount: 5,
  uptimeHours: 342.5
};

export const initialMemories: MemoryNode[] = [
  {
    id: 'mem-1',
    title: 'User Prefers Dark Glass Layout with Cyberpunk Blue Glow',
    category: 'User Preference',
    content: 'User prefers dark charcoal interface (#0B0F14), smooth glassmorphism cards, 12px border radii, and high contrast typography.',
    importance: 95,
    createdAt: '2026-07-20T10:30:00Z',
    lastAccessed: '2026-07-26T22:15:00Z',
    connections: ['mem-2', 'mem-5'],
    tags: ['UI', 'Preferences', 'Design System'],
    pinned: true
  },
  {
    id: 'mem-2',
    title: 'HiMe OS Core System Architecture & Vite Integration',
    category: 'Project Context',
    content: 'Full-stack Express + Vite environment running Gemini 3.6 Flash model on Cloud Run with port 3000 ingress proxying.',
    importance: 92,
    createdAt: '2026-07-21T14:10:00Z',
    lastAccessed: '2026-07-26T21:40:00Z',
    connections: ['mem-1', 'mem-3', 'mem-4'],
    tags: ['Architecture', 'Gemini', 'Express'],
    pinned: true
  },
  {
    id: 'mem-3',
    title: 'Automated GitHub PR Review Protocol',
    category: 'System Rule',
    content: 'Whenever a pull request is submitted to main branch, invoke Gemini 3.6 Flash to audit TypeScript types and lint checks.',
    importance: 88,
    createdAt: '2026-07-22T09:00:00Z',
    lastAccessed: '2026-07-25T18:00:00Z',
    connections: ['mem-2', 'mem-6'],
    tags: ['GitHub', 'CI/CD', 'Automations'],
    pinned: false
  },
  {
    id: 'mem-4',
    title: 'Neural Link Smart Band Bio-Calibration',
    category: 'Interaction',
    content: 'Calibrated heart-rate variability and focus index. Automatic focus mode engages when deep mental effort is detected above 85%.',
    importance: 75,
    createdAt: '2026-07-24T16:20:00Z',
    lastAccessed: '2026-07-26T11:00:00Z',
    connections: ['mem-2'],
    tags: ['IoT', 'Wearable', 'Focus'],
    pinned: false
  },
  {
    id: 'mem-5',
    title: 'Primary Cloud Database Schema Snippet',
    category: 'Code Snippet',
    content: 'export interface UserProfile { id: string; email: string; tier: "neural-pro"; memoryLimitNodes: 50000; }',
    importance: 82,
    createdAt: '2026-07-25T12:00:00Z',
    lastAccessed: '2026-07-26T20:00:00Z',
    connections: ['mem-1', 'mem-2'],
    tags: ['TypeScript', 'Database', 'Schema'],
    pinned: false
  },
  {
    id: 'mem-6',
    title: 'Smart Home Lighting Preset: Midnight Focus',
    category: 'User Preference',
    content: 'Sets studio LED strip color temperature to 2700K warm ambient glow at 30% intensity during code sessions after 8:00 PM.',
    importance: 68,
    createdAt: '2026-07-26T08:15:00Z',
    lastAccessed: '2026-07-26T22:00:00Z',
    connections: ['mem-3', 'mem-4'],
    tags: ['IoT', 'Lighting', 'Ambience'],
    pinned: false
  }
];

export const initialAutomations: AutomationWorkflow[] = [
  {
    id: 'auto-1',
    title: 'Nightly AI Memory Summarizer',
    description: 'Compresses daily interactions into core long-term memory graph nodes at midnight.',
    trigger: {
      id: 'trig-1',
      name: 'Midnight Schedule',
      type: 'trigger',
      icon: 'Clock',
      configSummary: 'Runs daily at 00:00 AM'
    },
    actions: [
      {
        id: 'act-1',
        name: 'Synthesize Chat History',
        type: 'ai-process',
        icon: 'Cpu',
        configSummary: 'Gemini 3.6 Flash summarize'
      },
      {
        id: 'act-2',
        name: 'Update Memory Graph',
        type: 'action',
        icon: 'Database',
        configSummary: 'Prune weak links & add new nodes'
      }
    ],
    enabled: true,
    schedule: 'Every day at 00:00',
    lastRun: '11 hours ago',
    successRate: 99.4,
    totalExecutions: 142
  },
  {
    id: 'auto-2',
    title: 'GitHub PR Auto-Review & Vulnerability Audit',
    description: 'Analyzes incoming PR diffs, checks security rules, and comments with suggestions.',
    trigger: {
      id: 'trig-2',
      name: 'Pull Request Opened',
      type: 'trigger',
      icon: 'GitPullRequest',
      configSummary: 'Repository: hime-os/core'
    },
    actions: [
      {
        id: 'act-3',
        name: 'Run Gemini Code Audit',
        type: 'ai-process',
        icon: 'ShieldCheck',
        configSummary: 'Static analysis & security pass'
      },
      {
        id: 'act-4',
        name: 'Post PR Comment',
        type: 'action',
        icon: 'MessageSquare',
        configSummary: 'Annotate code lines'
      }
    ],
    enabled: true,
    schedule: 'Event Triggered',
    lastRun: '2 hours ago',
    successRate: 100,
    totalExecutions: 89
  },
  {
    id: 'auto-3',
    title: 'Bio-Sync Focus Mode Light Control',
    description: 'Adjusts ambient room lights and mutes non-critical notifications when wear level exceeds 80%.',
    trigger: {
      id: 'trig-3',
      name: 'High Focus Score',
      type: 'trigger',
      icon: 'Activity',
      configSummary: 'Focus Band > 80%'
    },
    actions: [
      {
        id: 'act-5',
        name: 'Set IoT Lights to Cyan Pulse',
        type: 'action',
        icon: 'Sun',
        configSummary: 'Dim studio lights to 25%'
      },
      {
        id: 'act-6',
        name: 'Enable OS Do Not Disturb',
        type: 'action',
        icon: 'BellOff',
        configSummary: 'Silence non-urgent alerts'
      }
    ],
    enabled: true,
    schedule: 'Real-time Telemetry',
    lastRun: '35 mins ago',
    successRate: 98.2,
    totalExecutions: 310
  }
];

export const initialDevices: DeviceItem[] = [
  {
    id: 'dev-1',
    name: 'MacBook Pro M3 Max (Primary Workstation)',
    category: 'laptop',
    status: 'online',
    batteryPct: 92,
    connectionSignal: 98,
    ipAddress: '192.168.1.104',
    osVersion: 'macOS Sequoia + HiMe Agent v2.4',
    temperatureC: 41,
    lastActive: 'Active Now',
    iconName: 'Laptop',
    details: {
      cpuLoad: 18,
      storageUsedPct: 42,
      networkSpeedMbps: 850
    }
  },
  {
    id: 'dev-2',
    name: 'iPhone 16 Pro (Mobile Terminal)',
    category: 'phone',
    status: 'online',
    batteryPct: 78,
    connectionSignal: 92,
    ipAddress: '192.168.1.112',
    osVersion: 'iOS 18.2 + HiMe Mobile',
    temperatureC: 34,
    lastActive: '2 mins ago',
    iconName: 'Smartphone',
    details: {
      cpuLoad: 8,
      storageUsedPct: 61,
      networkSpeedMbps: 420
    }
  },
  {
    id: 'dev-3',
    name: 'Neural Link Focus Band',
    category: 'wearable',
    status: 'syncing',
    batteryPct: 64,
    connectionSignal: 85,
    ipAddress: 'BLE-994A-21',
    osVersion: 'NeuroOS v1.1',
    temperatureC: 36.8,
    lastActive: 'Streaming',
    iconName: 'Activity',
    details: {
      cpuLoad: 4,
      storageUsedPct: 12,
      networkSpeedMbps: 15
    }
  },
  {
    id: 'dev-4',
    name: 'HiMe Studio Hub & IoT Gateway',
    category: 'hub',
    status: 'online',
    batteryPct: 100,
    connectionSignal: 100,
    ipAddress: '192.168.1.1',
    osVersion: 'HiMe Hub OS v3.0',
    temperatureC: 38,
    lastActive: 'Active Now',
    iconName: 'Server',
    details: {
      cpuLoad: 12,
      storageUsedPct: 24,
      networkSpeedMbps: 1200
    }
  },
  {
    id: 'dev-5',
    name: 'Ambient Studio LED Array',
    category: 'iot',
    status: 'online',
    batteryPct: 100,
    connectionSignal: 90,
    ipAddress: '192.168.1.180',
    osVersion: 'Zigbee 3.0 Node',
    temperatureC: 31,
    lastActive: 'Active Now',
    iconName: 'Lightbulb',
    details: {
      cpuLoad: 2,
      storageUsedPct: 5,
      networkSpeedMbps: 2
    }
  }
];

export const initialGithubRepos: GithubRepo[] = [
  {
    id: 'repo-1',
    name: 'hime-os/core-engine',
    description: 'Next-generation AI operating system core with real-time neural thread allocation.',
    language: 'TypeScript',
    stars: 12450,
    forks: 1820,
    openIssues: 14,
    pullRequestsCount: 3,
    lastCommitMessage: 'feat: add Gemini 3.6 Flash streaming response pipeline',
    lastCommitTime: '18 mins ago',
    cicdStatus: 'passing',
    aiReviewStatus: 'approved'
  },
  {
    id: 'repo-2',
    name: 'hime-os/neural-memory-graph',
    description: '2D/3D dynamic memory node vector store and relationship mapper.',
    language: 'TypeScript',
    stars: 4890,
    forks: 620,
    openIssues: 5,
    pullRequestsCount: 1,
    lastCommitMessage: 'fix: optimize node connection distance layout math',
    lastCommitTime: '1 hour ago',
    cicdStatus: 'passing',
    aiReviewStatus: 'approved'
  },
  {
    id: 'repo-3',
    name: 'hime-os/device-gateway-sdk',
    description: 'Cross-platform IoT and BLE device sync library with encrypted RPC protocol.',
    language: 'Rust / C++',
    stars: 2310,
    forks: 210,
    openIssues: 8,
    pullRequestsCount: 2,
    lastCommitMessage: 'refactor: lower BLE latency on wearable focus band packets',
    lastCommitTime: '4 hours ago',
    cicdStatus: 'building',
    aiReviewStatus: 'action-needed'
  }
];

export const initialFiles: FileItem[] = [
  {
    id: 'file-1',
    name: 'System_Architecture_Blueprint.md',
    type: 'document',
    size: '142 KB',
    modified: 'Today, 20:15',
    tags: ['Architecture', 'Docs'],
    isCloud: true,
    starred: true,
    path: '/documents/System_Architecture_Blueprint.md',
    contentPreview: '# HiMe OS - Architectural Blueprint\n\nHiMe OS operates as a high-frequency intelligent orchestrator between system hardware, ambient IoT signals, and the Gemini AI model suite.'
  },
  {
    id: 'file-2',
    name: 'server.ts',
    type: 'code',
    size: '8.4 KB',
    modified: 'Just now',
    tags: ['Backend', 'Express', 'Gemini'],
    isCloud: false,
    starred: true,
    path: '/src/server.ts',
    contentPreview: 'import express from "express";\nimport { GoogleGenAI } from "@google/genai";\n\nconst app = express();\n// Express + Vite full-stack server entry point'
  },
  {
    id: 'file-3',
    name: 'Memory_Graph_Export_2026.json',
    type: 'document',
    size: '1.2 MB',
    modified: 'Yesterday',
    tags: ['AI Memory', 'Backup'],
    isCloud: true,
    starred: false,
    path: '/backups/Memory_Graph_Export_2026.json',
    contentPreview: '{\n  "version": "2.4",\n  "totalNodes": 1284,\n  "lastSynced": "2026-07-26T22:00:00Z"\n}'
  },
  {
    id: 'file-4',
    name: 'neural_ui_mockup.png',
    type: 'image',
    size: '3.4 MB',
    modified: '3 days ago',
    tags: ['Design', 'Assets'],
    isCloud: false,
    starred: false,
    path: '/assets/neural_ui_mockup.png',
    contentPreview: '[Image Binary File - 3840x2160 Glassmorphism UI Screen]'
  },
  {
    id: 'file-5',
    name: 'focus_soundscape_cyber_ambient.mp3',
    type: 'audio',
    size: '18.5 MB',
    modified: '5 days ago',
    tags: ['Audio', 'Focus'],
    isCloud: true,
    starred: true,
    path: '/media/focus_soundscape_cyber_ambient.mp3',
    contentPreview: '[Audio Stream File - Binaural 432Hz Deep Focus]'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'AI System Memory Sync & Health Check',
    startTime: '09:00',
    endTime: '09:30',
    date: '2026-07-27',
    type: 'ai-task',
    location: 'HiMe OS Internal Bus',
    aiSuggested: true
  },
  {
    id: 'cal-2',
    title: 'Executive Architecture Review: Gemini 3.6 Pipeline',
    startTime: '11:00',
    endTime: '12:00',
    date: '2026-07-27',
    type: 'meeting',
    location: 'Virtual Hologram Room 4',
    attendees: ['Alex Vance (Lead)', 'Sarah Connor (Security)', 'Gemini AI Agent'],
    aiSuggested: false
  },
  {
    id: 'cal-3',
    title: 'Deep Focus Session: Neural Workflow Node Canvas',
    startTime: '14:00',
    endTime: '16:30',
    date: '2026-07-27',
    type: 'focus',
    location: 'Studio Quiet Zone',
    aiSuggested: true
  },
  {
    id: 'cal-4',
    title: 'Deploy HiMe OS Core v2.5 to Production Cluster',
    startTime: '17:00',
    endTime: '17:45',
    date: '2026-07-27',
    type: 'deadline',
    location: 'Cloud Run / GCP',
    aiSuggested: false
  }
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Audit Gemini 3.6 Flash streaming response latency',
    completed: false,
    priority: 'high',
    dueDate: '2026-07-27',
    estimatedMinutes: 30,
    category: 'AI Performance',
    aiBreakdown: [
      'Benchmark SSE route overhead',
      'Optimize buffer chunk sizes',
      'Verify User-Agent telemetry headers'
    ]
  },
  {
    id: 'task-2',
    title: 'Refine 2D Memory Graph node drag physics in React canvas',
    completed: true,
    priority: 'medium',
    dueDate: '2026-07-26',
    estimatedMinutes: 45,
    category: 'UI/UX Craft'
  },
  {
    id: 'task-3',
    title: 'Configure automated IoT lighting trigger for deep focus mode',
    completed: false,
    priority: 'low',
    dueDate: '2026-07-28',
    estimatedMinutes: 20,
    category: 'Smart Home'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Gemini 3.6 Model Latency Optimal',
    message: 'Average response latency is down 18% to 48ms across all active neural threads.',
    timestamp: '5 mins ago',
    category: 'ai-agent',
    priority: 'medium',
    read: false,
    actionLabel: 'View Benchmarks',
    actionId: 'nav-analytics'
  },
  {
    id: 'notif-2',
    title: 'GitHub PR #42 Approved by AI Auditor',
    message: 'Pull request "feat: add Gemini 3.6 Flash streaming response pipeline" passed all static security checks.',
    timestamp: '22 mins ago',
    category: 'github',
    priority: 'high',
    read: false,
    actionLabel: 'Open GitHub Workspace',
    actionId: 'nav-github'
  },
  {
    id: 'notif-3',
    title: 'Neural Focus Band Synchronized',
    message: 'Biometric stream connected. Current focus energy index: 86%.',
    timestamp: '1 hour ago',
    category: 'iot',
    priority: 'low',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Nightly Memory Compression Complete',
    message: '14 new memory nodes created and linked in the central graph.',
    timestamp: '11 hours ago',
    category: 'system',
    priority: 'medium',
    read: true,
    actionLabel: 'Explore Memory Graph',
    actionId: 'nav-ai-memory'
  }
];
