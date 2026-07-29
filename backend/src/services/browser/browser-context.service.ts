import { BrowserSessionOptions } from './provider.interface';
import { logger } from '../../config/logger';

export class BrowserContextService {
  getDefaultContextOptions(): Required<BrowserSessionOptions> {
    return {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 HiMeOS/1.0',
      cookies: [],
    };
  }

  prepareContextOptions(options?: BrowserSessionOptions): BrowserSessionOptions {
    const defaults = this.getDefaultContextOptions();
    const merged: BrowserSessionOptions = {
      headless: options?.headless ?? defaults.headless,
      viewport: options?.viewport ?? defaults.viewport,
      userAgent: options?.userAgent ?? defaults.userAgent,
      cookies: options?.cookies ?? defaults.cookies,
    };

    logger.debug(`[BrowserContextService] Configured viewport ${merged.viewport?.width}x${merged.viewport?.height}`);
    return merged;
  }
}
