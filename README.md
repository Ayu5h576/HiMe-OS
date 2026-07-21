# HiMe OS

<p align="center">
  <h3 align="center">One AI. Every Device. One Memory.</h3>

  <p align="center">
    HiMe OS is an AI Operating System designed to become the intelligent layer between users, their devices, applications, and AI models.
  </p>
</p>

---

# Overview

HiMe OS is an open-source AI Operating System that unifies modern AI, automation, memory, device control, and productivity into a single platform.

Unlike traditional AI chatbots, HiMe OS is designed to understand context, remember information, automate workflows, and interact with both software and hardware.

The long-term objective is to build a platform that connects:

- 💻 Computers
- 📱 Mobile Devices
- ☁️ Cloud Services
- 🤖 Multiple AI Models
- 🏠 IoT Devices
- 🎤 Voice Interfaces
- 🧠 Long-Term Memory
- ⚡ Intelligent Automations

---

# Vision

> **One AI. Every Device. One Memory.**

Instead of switching between multiple applications and assistants, users interact with a single intelligent operating system that understands their work, remembers context, and performs actions across connected devices.

---

# Core Features

## AI Assistant

- Natural conversations
- Context-aware responses
- Multi-model AI support
- Long-term memory
- Project awareness

---

## Device Control

HiMe OS is designed to control both software and hardware.

Examples include:

- Laptop
- Desktop
- Android devices
- Smart TVs
- Bluetooth devices

Future integrations include:

- Smart lights
- Smart plugs
- Security cameras
- Door locks
- ESP32
- Raspberry Pi

---

## Desktop Agent

The desktop agent is responsible for interacting directly with the user's computer.

Capabilities include:

- Launching applications
- Opening VS Code
- Running terminal commands
- File searching
- System monitoring
- Project management

---

## Mobile Companion

The mobile application extends HiMe OS beyond the desktop.

Features include:

- AI Chat
- Voice Assistant
- Notifications
- Remote Device Control
- Automation Management

---

## AI Memory

HiMe OS is designed with persistent memory.

It can remember:

- Conversations
- Projects
- Preferences
- Files
- Tasks
- Workflows

The goal is to eliminate repetitive prompting.

---

## Automation Engine

HiMe OS allows users to automate workflows through natural language.

Example:

> "I'm going to study."

HiMe OS can automatically:

- Enable Focus Mode
- Open VS Code
- Launch GitHub
- Open the current project
- Play a study playlist
- Start a Pomodoro timer

---

# High-Level Architecture

```text
                    Frontend
                        │
          REST API / WebSocket
                        │
                    Backend
      ┌───────────────┼───────────────┐
      │               │               │
  AI Engine      Memory Service   Authentication
      │               │               │
      └───────────────┼───────────────┘
                      │
                 PostgreSQL
                      │
      ┌───────────────┼───────────────┐
      │               │               │
 Desktop Agent   Mobile App      IoT Devices
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Backend

- Fastify
- TypeScript
- PostgreSQL
- Prisma
- JWT
- Redis
- Zod
- Pino

## AI

- OpenAI
- Anthropic Claude
- Google Gemini
- Local LLM Support

## Mobile

- Flutter

## Desktop

- Tauri / Electron

---

# Repository Structure

```text
HiMe-OS/
├── backend/              # Backend application
├── docs/
│   └── images/           # README assets
├── public/               # Static assets
├── src/                  # Frontend source
├── .gitignore
├── .oxlintrc.json
├── components.json
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Ayu5h576/HiMe-OS.git
cd HiMe-OS
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the backend:

```bash
cd backend
npm install
npm run dev
```

---

# Design Principles

HiMe OS follows these principles:

- Production-first architecture
- Modular design
- Clean Architecture
- SOLID principles
- Security by default
- Scalability
- AI-first user experience
- Cross-platform compatibility

---

# Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

# License

This project is currently under active development.

A license will be added before the first stable release.

---

# Author

**Ayush Rawat**

Computer Science Student • Full Stack Developer • UI/UX Designer

GitHub:
https://github.com/Ayu5h576

---

## ⭐ Support

If you like HiMe OS, consider giving the repository a ⭐.

It helps support the project and increases its visibility.
