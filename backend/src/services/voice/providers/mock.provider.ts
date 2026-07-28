import {
  ISTTProvider,
  ITTSProvider,
  AudioPayload,
  STTResult,
  STTOptions,
  TTSResult,
  TTSOptions,
} from '../voice-provider.interface';
import { logger } from '../../../config/logger';

// ── Mock STT Provider ─────────────────────────────────────────────────────────

/**
 * MockSTTProvider — deterministic stub for testing and development.
 *
 * Returns a consistent transcript based on audio length, no external API needed.
 * Replace this with a real provider (Whisper, Google, Azure) by implementing ISTTProvider.
 */
export class MockSTTProvider implements ISTTProvider {
  readonly name = 'mock';
  readonly displayName = 'HiMe OS Mock STT (Development)';
  readonly isAvailable = true;

  async transcribe(audio: AudioPayload, options?: STTOptions): Promise<STTResult> {
    logger.debug(`[MockSTTProvider] Transcribing audio (format: ${audio.format})`);

    // Simulate processing delay proportional to audio size
    const simulatedDuration = this.estimateDuration(audio);
    await this.simulateProcessingDelay(simulatedDuration);

    // Mock transcript — in production, this calls the STT provider API
    const transcript = this.generateMockTranscript(audio, options?.language);

    return {
      transcript,
      confidence: 0.97,
      language: options?.language ?? 'en-US',
      durationSeconds: simulatedDuration,
      provider: this.name,
      metadata: {
        format: audio.format,
        sampleRate: audio.sampleRate ?? 16000,
        channels: audio.channels ?? 1,
        mock: true,
      },
      processedAt: new Date().toISOString(),
    };
  }

  private estimateDuration(audio: AudioPayload): number {
    if (audio.durationSeconds) return audio.durationSeconds;
    // Rough estimation from base64 data length (very approximate)
    const bytes = Math.round((audio.data.length * 3) / 4);
    return Math.max(0.5, Math.min(30, bytes / 16000));
  }

  private async simulateProcessingDelay(duration: number): Promise<void> {
    // Simulate ~10% of audio duration as processing time, capped at 50ms for tests
    const delay = Math.min(50, Math.round(duration * 100));
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }

  private generateMockTranscript(audio: AudioPayload, language?: string): string {
    const lang = language ?? 'en-US';

    // Generate deterministic mock transcript based on audio data hash
    const dataLength = audio.data.length;
    const transcripts = [
      'What is the current system status?',
      'Show me my active tasks.',
      'Read the contents of my documents folder.',
      'Set a reminder for tomorrow morning.',
      'What devices are currently connected?',
      'Play the latest notification.',
      'Search my memory for project notes.',
    ];

    const index = dataLength % transcripts.length;
    const base = transcripts[index];

    return lang.startsWith('en') ? base : `[${lang}] ${base}`;
  }
}

// ── Mock TTS Provider ─────────────────────────────────────────────────────────

/**
 * MockTTSProvider — deterministic stub for testing and development.
 *
 * Returns simulated base64 audio data without calling any real TTS API.
 * Replace by implementing ITTSProvider with a real provider (Google, Azure, ElevenLabs).
 */
export class MockTTSProvider implements ITTSProvider {
  readonly name = 'mock';
  readonly displayName = 'HiMe OS Mock TTS (Development)';
  readonly isAvailable = true;
  readonly availableVoices = ['mock-voice-en-US-f1', 'mock-voice-en-US-m1', 'mock-voice-en-GB-f1'];

  async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
    logger.debug(`[MockTTSProvider] Synthesizing ${text.length} characters`);

    if (!text || text.trim().length === 0) {
      throw new Error('Text must not be empty for TTS synthesis');
    }

    // Simulate processing delay
    await new Promise<void>((resolve) => setTimeout(resolve, 20));

    const voice = options?.voice ?? this.availableVoices[0];
    const format = options?.format ?? 'wav';
    const speed = options?.speed ?? 1.0;

    // Approximate: ~3 chars per 100ms at normal speed
    const durationSeconds = Math.max(0.5, (text.length / 30) / speed);

    // Generate deterministic mock audio data (base64 of repeated pattern)
    const mockAudioData = this.generateMockAudio(text, format);

    return {
      audioData: mockAudioData,
      format,
      durationSeconds,
      provider: this.name,
      voice,
      characterCount: text.length,
      metadata: {
        speed,
        pitch: options?.pitch ?? 1.0,
        language: options?.language ?? 'en-US',
        mock: true,
      },
      synthesizedAt: new Date().toISOString(),
    };
  }

  private generateMockAudio(text: string, format: string): string {
    // Generate pseudo-audio: base64 of a pattern derived from the text
    const pattern = `MOCK_AUDIO[${format.toUpperCase()}]:${text.substring(0, 20)}...`;
    return Buffer.from(pattern).toString('base64');
  }
}
