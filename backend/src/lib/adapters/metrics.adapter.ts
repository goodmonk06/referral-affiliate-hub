// Metrics Adapter Interface

export interface MetricLabels {
  [key: string]: string | number;
}

/**
 * Adapter interface for recording metrics
 * Implementations: Prometheus, StatsD, CloudWatch, Datadog, etc.
 */
export interface IMetricsAdapter {
  recordCounter(name: string, value: number, labels?: MetricLabels): void;
  recordGauge(name: string, value: number, labels?: MetricLabels): void;
  recordHistogram(name: string, value: number, labels?: MetricLabels): void;
  recordTiming(name: string, durationMs: number, labels?: MetricLabels): void;
}

/**
 * In-memory stub implementation for testing/development
 */
export class InMemoryMetricsAdapter implements IMetricsAdapter {
  private metrics: Map<
    string,
    { type: string; value: number; labels?: MetricLabels }[]
  > = new Map();

  recordCounter(name: string, value: number, labels?: MetricLabels): void {
    this.record(name, 'counter', value, labels);
  }

  recordGauge(name: string, value: number, labels?: MetricLabels): void {
    this.record(name, 'gauge', value, labels);
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    this.record(name, 'histogram', value, labels);
  }

  recordTiming(name: string, durationMs: number, labels?: MetricLabels): void {
    this.record(name, 'timing', durationMs, labels);
  }

  private record(
    name: string,
    type: string,
    value: number,
    labels?: MetricLabels,
  ): void {
    console.log(`[Metric] ${type} ${name}=${value}`, labels || '');

    const existing = this.metrics.get(name) || [];
    existing.push({ type, value, labels });
    this.metrics.set(name, existing);
  }

  getMetrics(name: string) {
    return this.metrics.get(name) || [];
  }

  clear(): void {
    this.metrics.clear();
  }
}
