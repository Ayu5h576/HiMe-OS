import {
  ISTTProvider,
  ITTSProvider,
  VoiceProviderInfo,
} from './voice-provider.interface';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

/**
 * VoiceProviderRegistry — singleton registry for STT and TTS providers.
 *
 * Mirrors the ToolRegistry pattern: providers are registered at startup
 * and resolved by name at runtime. Swapping a provider requires only
 * re-registration — no controller or service changes needed.
 */
export class VoiceProviderRegistry {
  private static instance: VoiceProviderRegistry;
  private sttProviders: Map<string, ISTTProvider> = new Map();
  private ttsProviders: Map<string, ITTSProvider> = new Map();

  private defaultSTTProvider: string | null = null;
  private defaultTTSProvider: string | null = null;

  static getInstance(): VoiceProviderRegistry {
    if (!VoiceProviderRegistry.instance) {
      VoiceProviderRegistry.instance = new VoiceProviderRegistry();
    }
    return VoiceProviderRegistry.instance;
  }

  // ── STT Provider Management ───────────────────────────────────────────────

  registerSTTProvider(provider: ISTTProvider, setAsDefault = false): void {
    logger.info(`[VoiceProviderRegistry] Registering STT provider: ${provider.name}`);
    this.sttProviders.set(provider.name, provider);

    if (setAsDefault || this.defaultSTTProvider === null) {
      this.defaultSTTProvider = provider.name;
    }
  }

  getSTTProvider(name?: string): ISTTProvider {
    const resolvedName = name ?? this.defaultSTTProvider;

    if (!resolvedName) {
      throw new BadRequestError('No STT provider is registered in VoiceProviderRegistry.');
    }

    const provider = this.sttProviders.get(resolvedName);
    if (!provider) {
      throw new NotFoundError(
        `STT provider '${resolvedName}' is not registered. Available: ${Array.from(this.sttProviders.keys()).join(', ')}`,
      );
    }

    return provider;
  }

  hasSTTProvider(name: string): boolean {
    return this.sttProviders.has(name);
  }

  // ── TTS Provider Management ───────────────────────────────────────────────

  registerTTSProvider(provider: ITTSProvider, setAsDefault = false): void {
    logger.info(`[VoiceProviderRegistry] Registering TTS provider: ${provider.name}`);
    this.ttsProviders.set(provider.name, provider);

    if (setAsDefault || this.defaultTTSProvider === null) {
      this.defaultTTSProvider = provider.name;
    }
  }

  getTTSProvider(name?: string): ITTSProvider {
    const resolvedName = name ?? this.defaultTTSProvider;

    if (!resolvedName) {
      throw new BadRequestError('No TTS provider is registered in VoiceProviderRegistry.');
    }

    const provider = this.ttsProviders.get(resolvedName);
    if (!provider) {
      throw new NotFoundError(
        `TTS provider '${resolvedName}' is not registered. Available: ${Array.from(this.ttsProviders.keys()).join(', ')}`,
      );
    }

    return provider;
  }

  hasTTSProvider(name: string): boolean {
    return this.ttsProviders.has(name);
  }

  // ── Provider Listing ──────────────────────────────────────────────────────

  listProviders(): VoiceProviderInfo[] {
    const results: VoiceProviderInfo[] = [];

    for (const provider of this.sttProviders.values()) {
      results.push({
        name: provider.name,
        displayName: provider.displayName,
        type: this.ttsProviders.has(provider.name) ? 'both' : 'stt',
        isAvailable: provider.isAvailable,
      });
    }

    for (const provider of this.ttsProviders.values()) {
      if (!this.sttProviders.has(provider.name)) {
        results.push({
          name: provider.name,
          displayName: provider.displayName,
          type: 'tts',
          isAvailable: provider.isAvailable,
          voices: provider.availableVoices,
        });
      } else {
        const existing = results.find((r) => r.name === provider.name);
        if (existing) {
          existing.voices = provider.availableVoices;
        }
      }
    }

    return results;
  }

  getDefaultSTTProviderName(): string | null {
    return this.defaultSTTProvider;
  }

  getDefaultTTSProviderName(): string | null {
    return this.defaultTTSProvider;
  }

  /**
   * Clears all registrations — used in tests only.
   */
  clear(): void {
    this.sttProviders.clear();
    this.ttsProviders.clear();
    this.defaultSTTProvider = null;
    this.defaultTTSProvider = null;
  }
}
