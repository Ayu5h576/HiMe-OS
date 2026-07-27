import { BadRequestError } from '../../utils/errors';

export class ScheduleEvaluatorService {
  private static PRESETS: Record<string, string> = {
    '@every_minute': '* * * * *',
    'every-minute': '* * * * *',
    'every_minute': '* * * * *',
    '@hourly': '0 * * * *',
    'hourly': '0 * * * *',
    '@daily': '0 0 * * *',
    'daily': '0 0 * * *',
    '@weekly': '0 0 * * 0',
    'weekly': '0 0 * * 0',
    '@monthly': '0 0 1 * *',
    'monthly': '0 0 1 * *',
  };

  /**
   * Normalizes presets to standard 5-part cron syntax.
   */
  static normalizeSchedule(schedule: string): string {
    const trimmed = schedule.trim().toLowerCase();
    return this.PRESETS[trimmed] || schedule.trim();
  }

  /**
   * Validates whether a schedule string is a valid preset or 5-part cron syntax.
   */
  static validate(schedule?: string | null): boolean {
    if (!schedule || schedule.trim().length === 0) {
      return true;
    }

    const normalized = this.normalizeSchedule(schedule);
    const parts = normalized.split(/\s+/);

    if (parts.length !== 5) {
      throw new BadRequestError(
        `Invalid schedule format: '${schedule}'. Expected 5-part cron syntax (e.g. '0 9 * * *') or supported preset`,
      );
    }

    const [min, hr, dom, mon, dow] = parts;

    if (
      !this.validateField(min, 0, 59) ||
      !this.validateField(hr, 0, 23) ||
      !this.validateField(dom, 1, 31) ||
      !this.validateField(mon, 1, 12) ||
      !this.validateField(dow, 0, 7)
    ) {
      throw new BadRequestError(`Invalid values in cron schedule: '${schedule}'`);
    }

    return true;
  }

  private static validateField(field: string, min: number, max: number): boolean {
    if (field === '*') return true;

    // Handle steps e.g. */5 or 1-30/5
    if (field.includes('/')) {
      const [rangePart, stepPart] = field.split('/');
      const step = parseInt(stepPart, 10);
      if (isNaN(step) || step <= 0) return false;
      if (rangePart === '*') return true;
      return this.validateField(rangePart, min, max);
    }

    // Handle lists e.g. 1,5,10
    if (field.includes(',')) {
      return field.split(',').every((sub) => this.validateField(sub, min, max));
    }

    // Handle ranges e.g. 1-5
    if (field.includes('-')) {
      const [startStr, endStr] = field.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end)) return false;
      return start >= min && end <= max && start <= end;
    }

    const val = parseInt(field, 10);
    if (isNaN(val)) return false;
    return val >= min && val <= max;
  }

  /**
   * Evaluates if a given schedule matches a target Date.
   */
  static isDue(schedule: string, targetDate: Date = new Date(), lastExecutedAt?: Date | null): boolean {
    if (!this.validate(schedule)) return false;

    const normalized = this.normalizeSchedule(schedule);
    const parts = normalized.split(/\s+/);
    const [minSpec, hrSpec, domSpec, monSpec, dowSpec] = parts;

    const targetMin = targetDate.getUTCMinutes();
    const targetHr = targetDate.getUTCHours();
    const targetDom = targetDate.getUTCDate();
    const targetMon = targetDate.getUTCMonth() + 1; // 1-12
    const targetDow = targetDate.getUTCDay(); // 0-6

    const matchesMin = this.matchField(minSpec, targetMin, 0, 59);
    const matchesHr = this.matchField(hrSpec, targetHr, 0, 23);
    const matchesDom = this.matchField(domSpec, targetDom, 1, 31);
    const matchesMon = this.matchField(monSpec, targetMon, 1, 12);
    const matchesDow = this.matchField(dowSpec, targetDow, 0, 7);

    const isMatch = matchesMin && matchesHr && matchesDom && matchesMon && matchesDow;
    if (!isMatch) return false;

    // Prevent double execution in the exact same minute
    if (lastExecutedAt) {
      const sameMinute =
        lastExecutedAt.getUTCFullYear() === targetDate.getUTCFullYear() &&
        lastExecutedAt.getUTCMonth() === targetDate.getUTCMonth() &&
        lastExecutedAt.getUTCDate() === targetDate.getUTCDate() &&
        lastExecutedAt.getUTCHours() === targetDate.getUTCHours() &&
        lastExecutedAt.getUTCMinutes() === targetDate.getUTCMinutes();
      if (sameMinute) {
        return false;
      }
    }

    return true;
  }

  private static matchField(spec: string, value: number, min: number, max: number): boolean {
    if (spec === '*') return true;

    // Handle steps e.g. */5 or 10-30/5
    if (spec.includes('/')) {
      const [rangePart, stepPart] = spec.split('/');
      const step = parseInt(stepPart, 10);
      let rangeStart = min;

      if (rangePart !== '*') {
        if (rangePart.includes('-')) {
          rangeStart = parseInt(rangePart.split('-')[0], 10);
        } else {
          rangeStart = parseInt(rangePart, 10);
        }
      }

      if (!this.matchField(rangePart, value, min, max)) return false;
      return (value - rangeStart) % step === 0;
    }

    // Handle lists e.g. 1,5,10
    if (spec.includes(',')) {
      return spec.split(',').some((sub) => this.matchField(sub, value, min, max));
    }

    // Handle ranges e.g. 1-5
    if (spec.includes('-')) {
      const [startStr, endStr] = spec.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      return value >= start && value <= end;
    }

    const targetVal = parseInt(spec, 10);
    if (spec === '7' && value === 0) return true; // Normalize 7 to Sunday 0
    return targetVal === value;
  }

  /**
   * Calculates the next execution date matching the schedule starting from a reference date.
   */
  static getNextExecution(schedule: string, fromDate: Date = new Date()): Date {
    this.validate(schedule);
    const next = new Date(fromDate.getTime());
    next.setUTCSeconds(0, 0);
    next.setUTCMinutes(next.getUTCMinutes() + 1); // start from next minute

    // Scan up to 1 year ahead (525600 minutes)
    for (let i = 0; i < 525600; i++) {
      if (this.isDue(schedule, next)) {
        return next;
      }
      next.setUTCMinutes(next.getUTCMinutes() + 1);
    }

    throw new BadRequestError(`Could not compute next execution date for schedule '${schedule}'`);
  }
}
