import os from 'os';
import { logger } from '../../config/logger';

export interface ScreenshotMetadata {
  capturedAt: string;
  platform: string;
  resolution: string;
  format: string;
  note: string;
}

export interface ScreenshotResult {
  success: boolean;
  metadata: ScreenshotMetadata;
  /**
   * Base64-encoded PNG data, when a capture backend is available.
   * In the current abstraction layer, this is a stub until a native screencap
   * library (e.g., screenshot-desktop, nativeImage via Electron) is wired in.
   */
  data: string | null;
  message: string;
}

export class ScreenshotService {
  /**
   * Captures a full desktop screenshot.
   *
   * Architecture note: The actual OS screenshot call is intentionally abstracted
   * behind this method. Production wiring would inject a platform-specific adapter
   * (e.g., screenshot-desktop for Node, or a system tray agent for Electron).
   * This stub returns metadata + a null payload to keep the test suite platform-agnostic.
   */
  async captureDesktop(): Promise<ScreenshotResult> {
    logger.info('[ScreenshotService] Capturing desktop screenshot (stub)');

    const platform = os.platform();

    const metadata: ScreenshotMetadata = {
      capturedAt: new Date().toISOString(),
      platform,
      resolution: this.getExpectedResolution(platform),
      format: 'png',
      note:
        'Desktop screenshot abstraction layer. Actual capture requires a platform-specific adapter ' +
        '(screenshot-desktop, nativeImage, or system-tray agent). Data will be non-null once wired.',
    };

    return {
      success: true,
      metadata,
      data: null, // Stub — replaced by actual base64 PNG when adapter is installed
      message: 'Screenshot abstraction invoked successfully. Platform adapter not yet wired.',
    };
  }

  /**
   * Returns the expected resolution hint for the current platform.
   * This is informational; actual dimensions require the capture adapter.
   */
  private getExpectedResolution(platform: string): string {
    switch (platform) {
      case 'win32':
        return 'detected-via-GetSystemMetrics-on-adapter-install';
      case 'darwin':
        return 'detected-via-CGDisplayBounds-on-adapter-install';
      default:
        return 'detected-via-xrandr-on-adapter-install';
    }
  }

  /**
   * Returns information about the current screenshot backend status.
   */
  getBackendStatus(): {
    available: boolean;
    platform: string;
    adapterRequired: string;
  } {
    const platform = os.platform();

    const adapterMap: Record<string, string> = {
      win32: 'screenshot-desktop (npm) or PowerShell Bitmap API',
      darwin: 'screencapture CLI or screenshot-desktop (npm)',
      linux: 'scrot, import (ImageMagick), or screenshot-desktop (npm)',
    };

    return {
      available: false,
      platform,
      adapterRequired: adapterMap[platform] ?? 'screenshot-desktop (npm)',
    };
  }
}
