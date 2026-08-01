// HiMe OS Comprehensive Unified API Client Service
// Integrates all 24 backend modules: Auth, Desktop Agent, Runtime Agent, Conversation,
// Memory, Voice, Vision, Browser, Automation, Notifications, Activity, Multi-Agent.

const BASE_URL = 'http://localhost:4000';

class HimeApiService {
  private token: string | null = localStorage.getItem('hime_access_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('hime_access_token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('hime_access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        // Handle 401 token refresh/re-auth if needed
        const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorBody.error || errorBody.message || `HTTP error ${res.status}`);
      }

      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err: unknown) {
      console.warn(`[HimeApiClient] API error on ${endpoint}:`, err);
      throw err;
    }
  }

  private activeProjectId: string | null = null;

  async getActiveProjectId(): Promise<string> {
    if (this.activeProjectId) return this.activeProjectId;
    try {
      const projects = await this.getProjects();
      if (projects && projects.length > 0) {
        this.activeProjectId = projects[0].id;
        return projects[0].id;
      }
      const created = await this.createProject('HiMe OS Workspace');
      this.activeProjectId = created.id;
      return created.id;
    } catch {
      return 'default-project-id';
    }
  }

  async registerDemoUser(): Promise<{ accessToken: string; user: { id: string; name: string; email: string } }> {
    const email = `hime-user-${Date.now()}@himeos.local`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'HiMe Operating System User',
        email,
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async getMe() {
    return this.request<{ id: string; name: string; email: string }>('/auth/me');
  }

  async ensureAuthenticated(): Promise<string> {
    const existing = this.getToken();
    if (existing) {
      try {
        await this.getMe();
        await this.getActiveProjectId();
        return existing;
      } catch {
        // Token invalid, fallback to register
      }
    }
    const reg = await this.registerDemoUser();
    await this.getActiveProjectId();
    return reg.accessToken;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Native Desktop Runtime Agent Endpoints (Phase 24)
  // ───────────────────────────────────────────────────────────────────────────

  async getRuntimeStatus() {
    return this.request<{
      agentName: string;
      version: string;
      isOnline: boolean;
      watchedFolders: string[];
      health: {
        status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        version: string;
        os: string;
        agentUptimeSeconds: number;
        latencyMs: number;
        cpuUsagePercent: number;
        ramUsagePercent: number;
        lastHeartbeat: string;
      };
    }>('/runtime-agent/status');
  }

  async getRuntimeSystem() {
    return this.request<{
      system: { os: string; hostname: string; network: string; activeWindow: string };
      cpu: { model: string; cores: number; usagePercent: number };
      ram: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number };
      storage: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number; mountPoint: string };
      battery: { percent: number; isCharging: boolean; timeRemainingMinutes: number };
    }>('/runtime-agent/system');
  }

  async getRuntimeProcesses() {
    return this.request<Array<{ pid: number; name: string; cpuPercent: number; memoryMB: number; status: string }>>('/runtime-agent/processes');
  }

  async launchRuntimeApp(appName: string) {
    return this.request<{ success: boolean; pid: number; appName: string }>('/runtime-agent/apps/launch', {
      method: 'POST',
      body: JSON.stringify({ appName }),
    });
  }

  async closeRuntimeApp(target: string | number) {
    return this.request<{ success: boolean; message: string }>('/runtime-agent/apps/close', {
      method: 'POST',
      body: JSON.stringify({ target: String(target) }),
    });
  }

  async executeRuntimeAction(action: string, value?: number, target?: string) {
    return this.request<{ success: boolean; message: string; details?: Record<string, unknown> }>('/runtime-agent/system/action', {
      method: 'POST',
      body: JSON.stringify({ action, value, target }),
    });
  }

  async getRuntimeBattery() {
    return this.request<{ percent: number; isCharging: boolean; timeRemainingMinutes: number }>('/runtime-agent/battery');
  }

  async getRuntimeEvents(type?: string, limit = 50) {
    const q = type ? `?type=${type}&limit=${limit}` : `?limit=${limit}`;
    return this.request<Array<{ id: string; type: string; data: Record<string, unknown>; timestamp: string }>>(`/runtime-agent/events${q}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Desktop Agent Endpoints (Phase 19)
  // ───────────────────────────────────────────────────────────────────────────

  async getDesktopStatus() {
    return this.request<{ status: string; version: string; capabilities: string[] }>('/desktop/status');
  }

  async getDesktopSystemInfo() {
    return this.request<{ os: string; hostname: string; cpuModel: string; ramTotalGB: number; ramFreeGB: number; network: string }>('/desktop/system/info');
  }

  async getDesktopHealth() {
    return this.request<{ status: string; cpuPressure: string; memoryPressure: string }>('/desktop/system/health');
  }

  async getDesktopApps() {
    return this.request<Array<{ pid: number; name: string; memoryMB: number }>>('/desktop/apps');
  }

  async launchDesktopApp(appName: string) {
    return this.request<{ success: boolean; pid: number; appName: string }>('/desktop/apps/launch', {
      method: 'POST',
      body: JSON.stringify({ appName }),
    });
  }

  async getDesktopClipboard() {
    return this.request<{ content: string; length: number; copiedAt: string }>('/desktop/clipboard');
  }

  async setDesktopClipboard(text: string) {
    return this.request<{ success: boolean; message: string }>('/desktop/clipboard', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getDesktopFiles(folder = '.') {
    return this.request<Array<{ name: string; isDirectory: boolean; size: number; path: string }>>(`/desktop/files?folder=${encodeURIComponent(folder)}`);
  }

  async takeDesktopScreenshot() {
    return this.request<{ success: boolean; imageUri: string; timestamp: string }>('/desktop/screenshot', {
      method: 'POST',
      body: JSON.stringify({ format: 'png' }),
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Projects, Conversations & AI Engine (Phases 3, 5, 7, 21)
  // ───────────────────────────────────────────────────────────────────────────

  async getProjects() {
    return this.request<Array<{ id: string; name: string; description?: string; createdAt: string }>>('/projects');
  }

  async createProject(name = 'HiMe Personal OS Workspace') {
    return this.request<{ id: string; name: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description: 'Default Personal Workspace' }),
    });
  }

  async getConversations(projectId: string) {
    return this.request<Array<{ id: string; title: string; updatedAt: string }>>(`/projects/${projectId}/conversations`);
  }

  async createConversation(projectId: string, title = 'New OS Conversation') {
    return this.request<{ id: string; title: string }>(`/projects/${projectId}/conversations`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getMessages(conversationId: string) {
    return this.request<Array<{ id: string; role: string; content: string; createdAt: string }>>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    return this.request<{ id: string; role: string; content: string }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
  }

  async sendAIChat(prompt: string, conversationId?: string, provider?: string, model?: string) {
    return this.request<{
      content: string;
      model: string;
      provider: string;
      toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
      tokensUsed?: number;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, conversationId, provider, model }),
    });
  }

  async executeMultiAgent(prompt: string) {
    return this.request<{
      orchestrationId: string;
      status: string;
      executionPlan: { planId: string; subtasks: Array<{ id: string; title: string; agentType: string; status: string }> };
      aggregatedResult: string;
      subtaskResults: Array<{ subtaskId: string; agentType: string; success: boolean; output: Record<string, unknown> }>;
    }>('/agents/execute', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async getAIProviders() {
    return this.request<Array<{ name: string; enabled: boolean; reachable: boolean; activeModel: string; availableModels: string[] }>>('/ai/providers');
  }

  async getOllamaModels() {
    return this.request<Array<{ name: string; model: string; modifiedAt: string; size: number; digest: string }>>('/ai/providers/ollama/models');
  }

  async getOllamaStatus() {
    return this.request<{ reachable: boolean; enabled: boolean; host: string; version: string; status: string; activeModel: string; installedModelsCount: number; installedModels: string[]; latencyMs: number; memoryUsageBytes?: number }>('/ai/providers/ollama/status');
  }

  async setOllamaModel(model: string) {
    return this.request<{ activeModel: string }>('/ai/providers/ollama/model', {
      method: 'POST',
      body: JSON.stringify({ model }),
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Memory System (Phase 6, 9, 10)
  // ───────────────────────────────────────────────────────────────────────────

  async getMemories(projectId?: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<Array<{ id: string; title: string; category: string; content: string; importance: number; createdAt: string; pinned?: boolean }>>(`/projects/${pid}/memories`);
  }

  async createMemory(projectId: string | undefined, title: string, category: string, content: string, importance = 80) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<{ id: string; title: string; content: string }>(`/projects/${pid}/memories`, {
      method: 'POST',
      body: JSON.stringify({ title, category, content, importance }),
    });
  }

  async searchMemories(query: string) {
    return this.request<Array<{ id: string; title: string; content: string; score: number }>>('/memories/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async deleteMemory(memoryId: string) {
    return this.request<{ success: boolean }>(`/memories/${memoryId}`, {
      method: 'DELETE',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Voice Interface Endpoints (Phase 20)
  // ───────────────────────────────────────────────────────────────────────────

  async startVoiceSession(conversationId?: string) {
    return this.request<{ sessionId: string; status: string }>('/voice/session/start', {
      method: 'POST',
      body: JSON.stringify({ conversationId }),
    });
  }

  async endVoiceSession(sessionId: string) {
    return this.request<{ success: boolean; durationSeconds: number }>('/voice/session/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async transcribeAudio(audioBase64: string, format = 'wav') {
    return this.request<{ transcript: string; confidence: number; aiResponse?: string }>('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioData: audioBase64, format }),
    });
  }

  async synthesizeSpeech(text: string, voiceId = 'hime-neural-female-1') {
    return this.request<{ audioUrl: string; durationSeconds: number }>('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
    });
  }

  async getVoiceProviders() {
    return this.request<{ sttProviders: string[]; ttsProviders: string[] }>('/voice/providers');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. Computer Vision Platform Endpoints (Phase 22)
  // ───────────────────────────────────────────────────────────────────────────

  async analyzeVisionImage(imageUri: string, features = ['ocr', 'objects', 'scene']) {
    return this.request<{
      ocr?: { text: string; confidence: number };
      objects?: Array<{ label: string; confidence: number; boundingBox: Record<string, number> }>;
      scene?: { description: string; tags: string[] };
    }>('/vision/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageUri, features }),
    });
  }

  async runOCR(imageUri: string) {
    return this.request<{ text: string; linesCount: number; confidence: number }>('/vision/ocr', {
      method: 'POST',
      body: JSON.stringify({ imageUri }),
    });
  }

  async detectVisionObjects(imageUri: string) {
    return this.request<Array<{ label: string; confidence: number; boundingBox: Record<string, number> }>>('/vision/objects', {
      method: 'POST',
      body: JSON.stringify({ imageUri }),
    });
  }

  async describeVisionScene(imageUri: string) {
    return this.request<{ description: string; dominantColors: string[]; environment: string }>('/vision/scene', {
      method: 'POST',
      body: JSON.stringify({ imageUri }),
    });
  }

  async analyzeVisionScreenshot(imageUri: string) {
    return this.request<{ windowTitle: string; detectedElements: string[]; textExtracted: string }>('/vision/screenshot', {
      method: 'POST',
      body: JSON.stringify({ imageUri }),
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. Browser Automation Platform Endpoints (Phase 23)
  // ───────────────────────────────────────────────────────────────────────────

  async openBrowserSession(url: string) {
    return this.request<{ sessionId: string; currentUrl: string; pageTitle: string }>('/browser/open', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async navigateBrowser(sessionId: string, action: 'navigate' | 'back' | 'forward' | 'refresh', targetUrl?: string) {
    return this.request<{ sessionId: string; currentUrl: string; pageTitle: string }>('/browser/navigate', {
      method: 'POST',
      body: JSON.stringify({ sessionId, action, targetUrl }),
    });
  }

  async performBrowserAction(sessionId: string, action: 'click' | 'type' | 'select' | 'scroll', selector?: string, value?: string) {
    return this.request<{ success: boolean; resultMessage: string }>('/browser/action', {
      method: 'POST',
      body: JSON.stringify({ sessionId, action, selector, value }),
    });
  }

  async extractBrowserDOM(sessionId: string) {
    return this.request<{ links: string[]; buttons: string[]; formsCount: number; pageText: string }>('/browser/extract', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async takeBrowserScreenshot(sessionId: string) {
    return this.request<{ screenshotUrl: string; width: number; height: number }>('/browser/screenshot', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getBrowserSessions() {
    return this.request<Array<{ sessionId: string; currentUrl: string; pageTitle: string; activeMinutes: number }>>('/browser/session');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. Automation Engine Endpoints (Phase 11, 16, 17)
  // ───────────────────────────────────────────────────────────────────────────

  async getAutomations(projectId?: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<Array<{ id: string; name: string; description?: string; enabled: boolean; lastRun?: string; executionCount: number }>>(`/projects/${pid}/automations`);
  }

  async createAutomation(projectId: string | undefined, name: string, triggerType: string, actionType: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<{ id: string; name: string; enabled: boolean }>(`/projects/${pid}/automations`, {
      method: 'POST',
      body: JSON.stringify({ name, triggerType, actionType, enabled: true }),
    });
  }

  async runAutomation(automationId: string) {
    return this.request<{ executionId: string; status: string; logs: string[] }>(`/automations/${automationId}/run`, {
      method: 'POST',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10. Notifications & Unified Activity Feed (Phase 18, 24)
  // ───────────────────────────────────────────────────────────────────────────

  async getNotifications() {
    return this.request<Array<{ id: string; title: string; message: string; category: string; priority: string; read: boolean; timestamp: string }>>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async getActivityFeed() {
    return this.request<Array<{ id: string; type: string; title: string; description: string; timestamp: string }>>('/runtime/activity');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. Device Framework & Task Management (Phase 4, 14)
  // ───────────────────────────────────────────────────────────────────────────

  async getProjectDevices(projectId?: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<Array<{
      id: string;
      name: string;
      type: string;
      manufacturer?: string;
      model?: string;
      status: string;
      connectionState: string;
      batteryLevel?: number;
      capabilities?: string[];
      metadata?: Record<string, unknown>;
    }>>(`/projects/${pid}/devices`);
  }

  async createDevice(projectId: string | undefined, name: string, type: string, manufacturer?: string, model?: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<{ id: string; name: string; type: string }>(`/projects/${pid}/devices`, {
      method: 'POST',
      body: JSON.stringify({ name, type, manufacturer, model }),
    });
  }

  async getDevice(id: string) {
    return this.request<{ id: string; name: string; type: string; status: string; connectionState: string; metadata?: Record<string, unknown> }>(`/devices/${id}`);
  }

  async updateDevice(id: string, updates: Record<string, unknown>) {
    return this.request<{ id: string; name: string; metadata?: Record<string, unknown> }>(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async connectDevice(id: string) {
    return this.request<{ id: string; status: string; connectionState: string }>(`/devices/${id}/connect`, {
      method: 'POST',
    });
  }

  async disconnectDevice(id: string) {
    return this.request<{ id: string; status: string; connectionState: string }>(`/devices/${id}/disconnect`, {
      method: 'POST',
    });
  }

  async deleteDevice(id: string) {
    return this.request<{ success: boolean }>(`/devices/${id}`, {
      method: 'DELETE',
    });
  }

  async getTasks(projectId?: string) {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<Array<{ id: string; title: string; description?: string; status: string; priority: string; dueDate?: string }>>(`/projects/${pid}/tasks`);
  }

  async createTask(projectId: string | undefined, title: string, description?: string, priority = 'MEDIUM') {
    const pid = (!projectId || projectId === 'default-project-id') ? await this.getActiveProjectId() : projectId;
    return this.request<{ id: string; title: string; status: string }>(`/projects/${pid}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, description, priority }),
    });
  }

  async updateTask(id: string, updates: Record<string, unknown>) {
    return this.request<{ id: string; title: string; status: string }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const himeApi = new HimeApiService();
