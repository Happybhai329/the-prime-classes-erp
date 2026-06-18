import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import {
  WEBHOOK_DELIVERY_JOB,
  WEBHOOK_QUEUE,
} from './api-platform.constants';
import { SecretCipherService } from './secret-cipher.service';

@Processor(WEBHOOK_QUEUE)
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cipher: SecretCipherService,
  ) {}

  @Process(WEBHOOK_DELIVERY_JOB)
  async deliver(job: Job<{ deliveryId: string }>) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: job.data.deliveryId },
      include: { event: true, endpoint: true },
    });
    if (!delivery || delivery.status === 'SUCCESS') {
      return;
    }

    const payload = JSON.stringify({
      id: delivery.event.id,
      type: delivery.event.eventType,
      createdAt: delivery.event.createdAt.toISOString(),
      data: delivery.event.payload,
    });
    const secret = this.cipher.decrypt(delivery.endpoint.secretEncrypted);
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    try {
      const response = await fetch(delivery.endpoint.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-prime-event-id': delivery.event.id,
          'x-prime-signature': `sha256=${signature}`,
        },
        body: payload,
        signal: AbortSignal.timeout(15000),
      });
      const responseBody = (await response.text()).slice(0, 4000);

      if (!response.ok) {
        throw new Error(`Webhook returned HTTP ${response.status}`);
      }

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SUCCESS',
          attemptCount: job.attemptsMade + 1,
          responseCode: response.status,
          responseBody,
          lastError: null,
        },
      });
    } catch (error: any) {
      const attempts = Number(job.opts.attempts || 1);
      const exhausted = job.attemptsMade + 1 >= attempts;
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: exhausted ? 'DEAD_LETTER' : 'FAILED',
          attemptCount: job.attemptsMade + 1,
          nextAttemptAt: exhausted
            ? null
            : new Date(Date.now() + 5000 * 2 ** job.attemptsMade),
          lastError: error.message,
        },
      });
      this.logger.warn(
        `Webhook delivery ${delivery.id} failed: ${error.message}`,
      );
      throw error;
    }
  }
}
