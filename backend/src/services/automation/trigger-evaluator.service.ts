import { Automation, TriggerType, ConditionType } from '@prisma/client';

export interface TriggerEvaluationPayload {
  triggerType?: TriggerType;
  value?: unknown;
  targetValue?: unknown;
}

export class TriggerEvaluatorService {
  static evaluate(automation: Automation, payload: TriggerEvaluationPayload = {}): boolean {
    if (!automation.enabled) {
      return false;
    }

    if (payload.triggerType && automation.triggerType !== payload.triggerType) {
      return false;
    }

    switch (automation.conditionType) {
      case ConditionType.ALWAYS:
        return true;

      case ConditionType.EQUALS:
        return String(payload.value) === String(payload.targetValue);

      case ConditionType.CONTAINS:
        if (typeof payload.value === 'string' && typeof payload.targetValue === 'string') {
          return payload.value.toLowerCase().includes(payload.targetValue.toLowerCase());
        }
        return false;

      case ConditionType.GREATER_THAN:
        if (typeof payload.value === 'number' && typeof payload.targetValue === 'number') {
          return payload.value > payload.targetValue;
        }
        return false;

      default:
        return true;
    }
  }
}
