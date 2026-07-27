export class ExecutionLockService {
  private static locks: Map<string, number> = new Map();

  /**
   * Attempts to acquire an execution lock for an automation ID.
   * Returns true if lock was successfully acquired, false if already locked.
   */
  static acquireLock(automationId: string, ttlMs: number = 60000): boolean {
    const now = Date.now();
    const existingExpiry = this.locks.get(automationId);

    if (existingExpiry && existingExpiry > now) {
      return false; // Already locked and active
    }

    this.locks.set(automationId, now + ttlMs);
    return true;
  }

  /**
   * Releases an active execution lock for an automation ID.
   */
  static releaseLock(automationId: string): void {
    this.locks.delete(automationId);
  }

  /**
   * Checks whether an automation ID is currently locked.
   */
  static isLocked(automationId: string): boolean {
    const now = Date.now();
    const existingExpiry = this.locks.get(automationId);
    if (!existingExpiry) return false;
    if (existingExpiry <= now) {
      this.locks.delete(automationId);
      return false;
    }
    return true;
  }

  /**
   * Clears all locks (used in tests or system resets).
   */
  static clearAllLocks(): void {
    this.locks.clear();
  }
}
