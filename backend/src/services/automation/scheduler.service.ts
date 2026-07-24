import { BadRequestError } from '../../utils/errors';

export class SchedulerService {
  static validateSchedule(schedule?: string | null): boolean {
    if (!schedule || schedule.trim().length === 0) {
      return true;
    }

    const parts = schedule.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new BadRequestError(
        `Invalid schedule format: '${schedule}'. Expected 5-part cron syntax (e.g. '0 9 * * *')`,
      );
    }

    return true;
  }
}
