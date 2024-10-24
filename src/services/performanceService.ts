export class PerformanceService {
  private metrics: Record<string, any> = {};

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errors: 0
    };
  }

  getMetrics() {
    return this.metrics;
  }

  async monitor<T>(fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.metrics.requestCount++;
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + (performance.now() - start)) 
        / this.metrics.requestCount;
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }
}
