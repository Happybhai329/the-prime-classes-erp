import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequests = new Counter({
    name: 'prime_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });
  readonly httpDuration = new Histogram({
    name: 'prime_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    registers: [this.registry],
  });
  readonly queueFailures = new Counter({
    name: 'prime_queue_failures_total',
    help: 'Background queue job failures',
    labelNames: ['queue', 'job'],
    registers: [this.registry],
  });
  readonly branchHealth = new Gauge({
    name: 'prime_branch_health',
    help: 'Latest branch health score from 0 to 100',
    labelNames: ['organization_id', 'tenant_id'],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'prime_' });
  }

  render() {
    return this.registry.metrics();
  }
}
