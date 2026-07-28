/**
 * Voice Provider Interfaces for HiMe OS Voice Interface Abstraction.
 *
 * These interfaces decouple voice logic from any specific STT/TTS provider.
 * Swap providers by registering a new implementation — no controller or service changes needed.
 */

// ── Audio Payload ─────────────────────────────────────────────────────────────

export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'webm' | 'raw';
export type AudioEncoding = 'base64' | 'buffer';

export interface AudioPayload {
  /** Base64-encoded audio data */
  data: string;
  format: AudioFormat;
  encoding: AudioEncoding;
  /** Sample rate in Hz (e.g. 16000, 44100) */
  sampleRate?: number;
  /** Number of audio channels (1=mono, 2=stereo) */
  channels?: number;
  /** Duration in seconds, if known */
  durationSeconds?: number;
}

// ── STT Types ─────────────────────────────────────────────────────────────────

export interface STTResult {
  /** The transcribed text */
  transcript: string;
  /** Confidence score 0.0 – 1.0 */
  confidence: number;
  /** Language detected or used */
  language: string;
  /** Duration of audio processed, in seconds */
  durationSeconds: number;
  /** Provider that performed the transcription */
  provider: string;
  /** Raw provider metadata (provider-specific) */
  metadata?: Record<string, unknown>;
  processedAt: string;
}

export interface STTOptions {
  language?: string;
  /** Hint vocabulary for domain-specific terms */
  hints?: string[];
}

// ── TTS Types ─────────────────────────────────────────────────────────────────

export interface TTSResult {
  /** Base64-encoded synthesized audio */
  audioData: string;
  format: AudioFormat;
  /** Duration of synthesized audio in seconds */
  durationSeconds: number;
  /** Provider that performed synthesis */
  provider: string;
  /** Voice ID or name used */
  voice: string;
  /** Character count of the input text */
  characterCount: number;
  metadata?: Record<string, unknown>;
  synthesizedAt: string;
}

export interface TTSOptions {
  /** Voice identifier (provider-specific) */
  voice?: string;
  /** Speed multiplier (1.0 = normal) */
  speed?: number;
  /** Pitch adjustment (1.0 = normal) */
  pitch?: number;
  /** Output format */
  format?: AudioFormat;
  language?: string;
}

// ── Provider Interfaces ───────────────────────────────────────────────────────

export interface ISTTProvider {
  /** Unique provider identifier (e.g. 'mock', 'whisper', 'google', 'azure') */
  readonly name: string;
  /** Human-readable display name */
  readonly displayName: string;
  /** Whether this provider is available/enabled */
  readonly isAvailable: boolean;

  transcribe(audio: AudioPayload, options?: STTOptions): Promise<STTResult>;
}

export interface ITTSProvider {
  /** Unique provider identifier */
  readonly name: string;
  readonly displayName: string;
  readonly isAvailable: boolean;
  /** Available voice IDs for this provider */
  readonly availableVoices: string[];

  synthesize(text: string, options?: TTSOptions): Promise<TTSResult>;
}

export interface IVoiceProvider {
  readonly stt: ISTTProvider;
  readonly tts: ITTSProvider;
}

// ── Provider Info ─────────────────────────────────────────────────────────────

export interface VoiceProviderInfo {
  name: string;
  displayName: string;
  type: 'stt' | 'tts' | 'both';
  isAvailable: boolean;
  voices?: string[];
}
