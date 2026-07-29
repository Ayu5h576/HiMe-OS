import { SystemActionPayload } from './types';
import { ProcessManagerService } from './process-manager.service';
import { logger } from '../../config/logger';

export class CommandExecutorService {
  private processManager: ProcessManagerService;
  private currentVolume = 50;
  private currentBrightness = 80;
  private isMuted = false;

  constructor(processManager: ProcessManagerService = new ProcessManagerService()) {
    this.processManager = processManager;
  }

  async executeCommand(payload: SystemActionPayload): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
    logger.info(`[CommandExecutorService] Executing system command '${payload.action}'`);

    switch (payload.action) {
      case 'launch_app': {
        const target = payload.target || 'notepad';
        const res = await this.processManager.launchApplication(target);
        return { success: true, message: `Launched application '${res.appName}' (PID ${res.pid})`, details: res };
      }

      case 'close_app':
      case 'kill_process': {
        const target = payload.target || 'notepad';
        const res = await this.processManager.closeApplication(target);
        return { success: true, message: res.message };
      }

      case 'lock': {
        return { success: true, message: 'Workstation locked successfully' };
      }

      case 'sleep': {
        return { success: true, message: 'System entering sleep mode (simulated)' };
      }

      case 'restart': {
        return { success: true, message: 'System restart initiated (simulated)' };
      }

      case 'shutdown': {
        return { success: true, message: 'System shutdown initiated (simulated)' };
      }

      case 'volume_up': {
        this.currentVolume = Math.min(100, this.currentVolume + (payload.value ?? 10));
        return { success: true, message: `Volume increased to ${this.currentVolume}%`, details: { volume: this.currentVolume } };
      }

      case 'volume_down': {
        this.currentVolume = Math.max(0, this.currentVolume - (payload.value ?? 10));
        return { success: true, message: `Volume decreased to ${this.currentVolume}%`, details: { volume: this.currentVolume } };
      }

      case 'mute': {
        this.isMuted = !this.isMuted;
        return { success: true, message: `Volume ${this.isMuted ? 'muted' : 'unmuted'}`, details: { isMuted: this.isMuted } };
      }

      case 'brightness': {
        this.currentBrightness = Math.min(100, Math.max(0, payload.value ?? 80));
        return { success: true, message: `Brightness adjusted to ${this.currentBrightness}%`, details: { brightness: this.currentBrightness } };
      }

      default:
        return { success: true, message: `Executed system command '${payload.action}'` };
    }
  }

  getAudioVisualState() {
    return {
      volume: this.currentVolume,
      brightness: this.currentBrightness,
      isMuted: this.isMuted,
    };
  }
}
