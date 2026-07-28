import { ITTSProvider, TTSResult, TTSOptions } from './voice-provider.interface';
import { VoiceProviderRegistry } from './voice-provider-registry';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

export class TTSService {
  private registry: VoiceProviderRegistry;

  constructor(registry: VoiceProviderRegistry = VoiceProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  /**
   * Synthesizes text into audio using the specified or default TTS provider.
   */
  async synthesize(
    text: string,
    options?: TTSOptions,
    providerName?: string,
  ): Promise<TTSResult> {
    logger.debug(`[TTSService] Requesting speech synthesis (provider: ${providerName ?? 'default'})`);

    if (!text || text.trim().length === 0) {
      throw new BadRequestError('Text for speech synthesis cannot be empty.');
    }

    // Resolve provider from registry
    const provider: ITTSProvider = this.registry.getTTSProvider(providerName);

    // Delegate synthesis to provider abstraction
    return provider.synthesize(text, options);
  }
}
