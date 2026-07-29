/**
 * Computer Vision Platform Interfaces for HiMe OS.
 *
 * Decouples vision perception logic from any specific vision provider or engine.
 */

export type ImageFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'gif';
export type ImageEncoding = 'base64' | 'buffer';

export interface ImagePayload {
  /** Base64-encoded image data */
  data: string;
  format: ImageFormat;
  encoding: ImageEncoding;
  width?: number;
  height?: number;
  filename?: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  category: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
  lines: string[];
  provider: string;
  processedAt: string;
}

export interface OCROptions {
  language?: string;
  detectLayout?: boolean;
}

export interface ObjectDetectionResult {
  objects: DetectedObject[];
  count: number;
  provider: string;
  processedAt: string;
}

export interface SceneDescriptionResult {
  summary: string;
  environment: 'indoor' | 'outdoor' | 'desktop' | 'document' | 'unknown';
  objects: string[];
  relationships: string[];
  peopleCount: number;
  dominantColors: string[];
  textDetected: boolean;
  provider: string;
  processedAt: string;
}

export interface QRScanResult {
  content: string;
  type: 'qr' | 'barcode' | 'unknown';
  format: string;
  boundingBox?: BoundingBox;
  provider: string;
  processedAt: string;
}

export interface ScreenshotAnalysisResult {
  type: 'desktop' | 'application' | 'terminal' | 'code' | 'error_dialog' | 'ui';
  summary: string;
  detectedText: string;
  uiElements: string[];
  errorDetected: boolean;
  errorMessage?: string;
  provider: string;
  processedAt: string;
}

export interface VisionAnalysisOptions {
  includeOCR?: boolean;
  includeObjects?: boolean;
  includeScene?: boolean;
  includeQR?: boolean;
  includeScreenshot?: boolean;
}

export interface VisionAnalysisResult {
  ocr?: OCRResult;
  objects?: ObjectDetectionResult;
  scene?: SceneDescriptionResult;
  qr?: QRScanResult;
  screenshot?: ScreenshotAnalysisResult;
  provider: string;
  analyzedAt: string;
}

export interface IVisionProvider {
  readonly name: string;
  readonly displayName: string;
  readonly isAvailable: boolean;

  analyze(image: ImagePayload, options?: VisionAnalysisOptions): Promise<VisionAnalysisResult>;
  ocr(image: ImagePayload, options?: OCROptions): Promise<OCRResult>;
  detectObjects(image: ImagePayload): Promise<ObjectDetectionResult>;
  describeScene(image: ImagePayload): Promise<SceneDescriptionResult>;
  scanQR(image: ImagePayload): Promise<QRScanResult>;
  analyzeScreenshot(image: ImagePayload): Promise<ScreenshotAnalysisResult>;
}

export interface VisionProviderInfo {
  name: string;
  displayName: string;
  isAvailable: boolean;
  capabilities: string[];
}
