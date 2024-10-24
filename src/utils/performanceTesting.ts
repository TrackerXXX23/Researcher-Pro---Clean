import { PerformanceMetrics } from '@/services/performanceService'

export interface PerformanceTestResult {
  name: string
  duration: number
  passed: boolean
  metrics: Partial<PerformanceMetrics>
  timestamp: Date
  memoryUsage?: number
  error?: string
}

export interface PerformanceTestConfig {
  name: string
  maxDuration?: number
  maxMemory?: number
  iterations?: number
  concurrent?: boolean
}

export class PerformanceTestRunner {
  private results: PerformanceTestResult[] = []

  async runTest(
    config: PerformanceTestConfig,
    testFn: () => Promise<void>
  ): Promise<PerformanceTestResult> {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize

    try {
      if (config.concurrent && config.iterations) {
        await this.runConcurrentTest(config, testFn)
      } else {
        await testFn()
      }

      const endTime = performance.now()
      const endMemory = (performance as any).memory?.usedJSHeapSize
      const duration = endTime - startTime
      const memoryUsage = endMemory ? endMemory - startMemory : undefined

      const result: PerformanceTestResult = {
        name: config.name,
        duration,
        passed: this.evaluateTest(duration, memoryUsage, config),
        metrics: {
          pageLoadTime: duration,
          memoryUsage: memoryUsage || 0,
        },
        timestamp: new Date(),
        memoryUsage,
      }

      this.results.push(result)
      return result
    } catch (error) {
      const result: PerformanceTestResult = {
        name: config.name,
        duration: performance.now() - startTime,
        passed: false,
        metrics: {},
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.results.push(result)
      return result
    }
  }

  private async runConcurrentTest(
    config: PerformanceTestConfig,
    testFn: () => Promise<void>
  ): Promise<void> {
    const iterations = config.iterations || 1
    const promises = Array(iterations)
      .fill(null)
      .map(() => testFn())
    await Promise.all(promises)
  }

  private evaluateTest(
    duration: number,
    memoryUsage: number | undefined,
    config: PerformanceTestConfig
  ): boolean {
    if (config.maxDuration && duration > config.maxDuration) {
      return false
    }

    if (config.maxMemory && memoryUsage && memoryUsage > config.maxMemory) {
      return false
    }

    return true
  }

  async measurePageLoad(url: string): Promise<PerformanceTestResult> {
    return this.runTest(
      {
        name: `Page Load Test: ${url}`,
        maxDuration: 1000, // 1 second
      },
      async () => {
        if (typeof window !== 'undefined') {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Failed to load page: ${response.statusText}`)
          }
        }
      }
    )
  }

  async measureApiResponse(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<PerformanceTestResult> {
    return this.runTest(
      {
        name: `API Response Test: ${endpoint}`,
        maxDuration: 200, // 200ms
      },
      async () => {
        const response = await fetch(endpoint, {
          method,
          body: body ? JSON.stringify(body) : undefined,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }
      }
    )
  }

  async measureConcurrentUsers(
    url: string,
    userCount: number
  ): Promise<PerformanceTestResult> {
    return this.runTest(
      {
        name: `Concurrent Users Test: ${url}`,
        iterations: userCount,
        concurrent: true,
        maxDuration: 1000 * userCount, // 1 second per user
      },
      async () => {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`)
        }
      }
    )
  }

  async measureComponentRender(
    renderFn: () => Promise<void>
  ): Promise<PerformanceTestResult> {
    return this.runTest(
      {
        name: 'Component Render Test',
        maxDuration: 100, // 100ms
      },
      renderFn
    )
  }

  getResults(): PerformanceTestResult[] {
    return this.results
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    const metrics = this.results.reduce(
      (acc, result) => {
        Object.entries(result.metrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            acc[key] = (acc[key] || 0) + value
          }
        })
        return acc
      },
      {} as Record<string, number>
    )

    Object.keys(metrics).forEach((key) => {
      metrics[key] /= this.results.length
    })

    return metrics as Partial<PerformanceMetrics>
  }

  clearResults(): void {
    this.results = []
  }
}

export const performanceTestRunner = new PerformanceTestRunner()
