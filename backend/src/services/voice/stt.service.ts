import { ISTTProvider, AudioPayload, STTResult, STTOptions } from './voice-provider.interface';
import { VoiceProviderRegistry } from './voice-provider-registry';
import { AudioStreamService } from './audio-stream.service';
import { logger } from '../../config/logger';

export class STTService {
  private registry: VoiceProviderRegistry;
  private audioStreamService: AudioStreamService;

  constructor(
    registry: VoiceProviderRegistry = VoiceProviderRegistry.getInstance(),
    audioStreamService: AudioStreamService = new AudioStreamService(),
  ) {
    this.registry = registry;
    this.audioStreamService = audioStreamService;
  }

  /**
   * Transcribes audio payload into text using the specified or default STT provider.
   */
  async transcribe(
    audio: AudioPayload,
    options?: STTOptions,
    providerName?: string,
  ): Promise<STTResult> {
    logger.debug(`[STTService] Requesting transcription (provider: ${providerName ?? 'default'})`);

    // 1. Validate payload
    this.audioStreamService.validateAudioPayload(audio);

    // 2. Resolve provider from registry
    const provider: ISTTProvider = this.registry.getSTTProvider(providerName);

    // 3. Delegate transcription to provider abstraction
    return provider.transcribe(audio, options);
  }
}
