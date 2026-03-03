export class InMemoryQueue {
  constructor({ maxAttempts = 3 } = {}) {
    this.maxAttempts = maxAttempts;
    this.pending = [];
    this.deadLetter = [];
    this.stats = {
      completed: 0,
      deadLetter: 0,
    };
  }

  async enqueue(type, handler) {
    this.pending.push({ type, handler, attempts: 0 });
  }

  async runPending() {
    while (this.pending.length > 0) {
      const job = this.pending.shift();
      await this.#runJob(job);
    }
  }

  async #runJob(job) {
    job.attempts += 1;

    try {
      await job.handler();
      this.stats.completed += 1;
    } catch (error) {
      if (job.attempts < this.maxAttempts) {
        this.pending.push(job);
        return;
      }

      this.deadLetter.push({
        type: job.type,
        attempts: job.attempts,
        reason: error instanceof Error ? error.message : String(error),
      });
      this.stats.deadLetter += 1;
    }
  }
}
