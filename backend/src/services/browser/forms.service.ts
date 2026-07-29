import { FormFillPayload, BrowserSessionState } from './provider.interface';
import { BrowserEngineService } from './browser-engine.service';
import { logger } from '../../config/logger';

export class FormService {
  private engineService: BrowserEngineService;

  constructor(engineService: BrowserEngineService = new BrowserEngineService()) {
    this.engineService = engineService;
  }

  async fillForm(
    sessionId: string,
    payload: FormFillPayload,
    providerName?: string,
  ): Promise<{ success: boolean; fieldsFilled: number; submitted: boolean; state: BrowserSessionState }> {
    logger.debug(`[FormService] Filling form with ${Object.keys(payload.fields).length} fields`);

    let lastState: BrowserSessionState | undefined;
    let count = 0;

    for (const [key, value] of Object.entries(payload.fields)) {
      const selector = payload.formSelector ? `${payload.formSelector} [name="${key}"]` : `[name="${key}"]`;
      const valStr = String(value);

      const res = await this.engineService.performAction(
        sessionId,
        { action: 'type', selector, text: valStr, value: valStr },
        providerName,
      );

      lastState = res.state;
      count++;
    }

    let submitted = false;
    if (payload.submit && lastState) {
      const submitSelector = payload.formSelector ? `${payload.formSelector} button[type="submit"]` : 'button[type="submit"]';
      const subRes = await this.engineService.performAction(
        sessionId,
        { action: 'click', selector: submitSelector },
        providerName,
      );
      lastState = subRes.state;
      submitted = true;
    }

    if (!lastState) {
      throw new Error('No fields were filled in form.');
    }

    return {
      success: true,
      fieldsFilled: count,
      submitted,
      state: lastState,
    };
  }
}
