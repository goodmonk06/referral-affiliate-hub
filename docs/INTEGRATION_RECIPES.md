# Integration Recipes

This document provides practical patterns for integrating the Referral & Affiliate Hub with common systems in a larger ecosystem.

## Recipe 1: Authentication & Authorization Integration

### With JWT-based Auth Service

```typescript
// middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      // Verify with auth service
      const user = await authService.verifyToken(token);
      req['user'] = user;
    }

    next();
  }
}

// Use in controllers
@Get('my-stats')
async getMyStats(@Request() req) {
  const userId = req.user.id;
  const partner = await this.partnersService.findByUserId(userId);
  return this.analyticsService.getPartnerStats(partner.id);
}
```

### Partner Self-Service API

```typescript
// Grant API access to partners
@Post('partners/:id/api-keys')
async generateApiKey(
  @Param('id') partnerId: string,
  @Body() dto: CreateApiKeyDto,
) {
  const apiKey = await this.apiKeyService.create({
    partnerId,
    name: dto.name,
    permissions: ['read:own-stats', 'read:own-payouts'],
  });

  return { key: apiKey.key }; // Return only once
}

// Validate API key middleware
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
      const key = await this.prisma.partnerApiKey.findUnique({
        where: { key: apiKey, status: 'ACTIVE' },
        include: { partner: true },
      });

      if (key) {
        req['partner'] = key.partner;
        req['permissions'] = key.permissions;
      }
    }

    next();
  }
}
```

## Recipe 2: E-commerce Platform Integration

### Shopify Integration

```typescript
// Track conversions from Shopify orders
@Post('webhooks/shopify/orders')
async handleShopifyOrder(@Body() order: ShopifyOrder) {
  // Extract referral info from order metadata
  const referralCode = order.note_attributes.find(
    (attr) => attr.name === 'referral_code'
  )?.value;

  if (!referralCode) return;

  const link = await this.referralLinksService.findByCode(referralCode);

  if (link) {
    await this.trackingService.recordConversion({
      partnerId: link.partnerId,
      amount: parseFloat(order.total_price),
      referredUserId: order.customer.id,
      metaJson: {
        platform: 'shopify',
        orderId: order.id,
        orderNumber: order.order_number,
        products: order.line_items.map(item => ({
          id: item.product_id,
          title: item.title,
          quantity: item.quantity,
        })),
      },
    });
  }
}

// Handle refunds/returns
@Post('webhooks/shopify/refunds')
async handleShopifyRefund(@Body() refund: ShopifyRefund) {
  const conversion = await this.prisma.conversionEvent.findFirst({
    where: {
      metaJson: { path: ['orderId'], equals: refund.order_id },
    },
  });

  if (conversion) {
    await this.conversionsService.reverse(conversion.id);
  }
}
```

### WooCommerce Integration

```typescript
// WooCommerce webhook handler
@Post('webhooks/woocommerce/order-completed')
async handleWooOrder(@Body() order: WooOrder) {
  const referralCookie = order.meta_data.find(
    (m) => m.key === '_referral_code'
  )?.value;

  if (referralCookie) {
    const link = await this.referralLinksService.findByCode(referralCookie);

    if (link) {
      await this.trackingService.recordConversion({
        partnerId: link.partnerId,
        amount: parseFloat(order.total),
        referredUserId: order.customer_id.toString(),
        metaJson: {
          platform: 'woocommerce',
          orderId: order.id,
        },
      });
    }
  }
}
```

## Recipe 3: SaaS Subscription Integration

### Stripe Subscription Tracking

```typescript
// Track initial subscription
@Post('webhooks/stripe')
async handleStripeWebhook(@Body() event: StripeEvent) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const referralCode = session.metadata.referral_code;

    if (referralCode) {
      const link = await this.referralLinksService.findByCode(referralCode);

      if (link) {
        await this.trackingService.recordConversion({
          partnerId: link.partnerId,
          amount: session.amount_total / 100,
          referredUserId: session.customer,
          metaJson: {
            platform: 'stripe',
            subscriptionId: session.subscription,
            priceId: session.metadata.price_id,
          },
        });
      }
    }
  }

  // Track recurring payments (if recurringCommission enabled)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;

    const originalConversion = await this.prisma.conversionEvent.findFirst({
      where: {
        metaJson: { path: ['subscriptionId'], equals: invoice.subscription },
      },
      include: { program: true },
    });

    if (originalConversion?.program.configJson?.recurringCommission) {
      await this.trackingService.recordConversion({
        partnerId: originalConversion.partnerId,
        amount: invoice.amount_paid / 100,
        referredUserId: invoice.customer,
        metaJson: {
          type: 'recurring',
          originalConversionId: originalConversion.id,
          invoiceId: invoice.id,
        },
      });
    }
  }
}
```

## Recipe 4: Notification Service Integration

### SendGrid Email Notifications

```typescript
// Implement INotificationAdapter
import SendGrid from '@sendgrid/mail';

export class SendGridAdapter implements INotificationAdapter {
  constructor(private apiKey: string) {
    SendGrid.setApiKey(apiKey);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const msg = {
        to: payload.to,
        from: 'noreply@example.com',
        subject: payload.subject,
        text: payload.body,
        html: payload.template
          ? await this.renderTemplate(payload.template, payload.data)
          : payload.body,
      };

      const [response] = await SendGrid.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Usage in event handlers
eventBus.on('payout.status_changed', async (event) => {
  if (event.payload.newStatus === 'PAID') {
    const partner = await prisma.partner.findUnique({
      where: { id: event.payload.partnerId },
    });

    await notificationAdapter.send({
      to: partner.contactEmail,
      subject: 'Your payout has been processed',
      template: 'payout-paid',
      data: {
        partnerName: partner.name,
        amount: event.payload.amount,
        transactionId: event.payload.transactionId,
      },
    });
  }
});
```

### Slack Notifications

```typescript
export class SlackAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      await axios.post(this.webhookUrl, {
        text: payload.body,
        blocks: payload.data?.blocks,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Notify admin on high-value conversions
eventBus.on('conversion.recorded', async (event) => {
  if (event.payload.amount > 1000) {
    await slackAdapter.send({
      to: '#high-value-conversions',
      body: `🎉 High-value conversion: $${event.payload.amount}`,
      data: {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Amount:* $${event.payload.amount}\n*Partner:* ${event.payload.partnerId}`,
            },
          },
        ],
      },
    });
  }
});
```

## Recipe 5: Analytics & Metrics Integration

### Prometheus Metrics

```typescript
import { Counter, Histogram, Registry } from 'prom-client';

export class PrometheusAdapter implements IMetricsAdapter {
  private registry: Registry;
  private counters: Map<string, Counter> = new Map();
  private histograms: Map<string, Histogram> = new Map();

  recordCounter(name: string, value: number, labels?: MetricLabels): void {
    let counter = this.counters.get(name);

    if (!counter) {
      counter = new Counter({
        name,
        help: `Counter for ${name}`,
        labelNames: Object.keys(labels || {}),
        registers: [this.registry],
      });
      this.counters.set(name, counter);
    }

    counter.inc(labels, value);
  }

  recordTiming(name: string, durationMs: number, labels?: MetricLabels): void {
    let histogram = this.histograms.get(name);

    if (!histogram) {
      histogram = new Histogram({
        name,
        help: `Histogram for ${name}`,
        labelNames: Object.keys(labels || {}),
        registers: [this.registry],
      });
      this.histograms.set(name, histogram);
    }

    histogram.observe(labels, durationMs / 1000); // Convert to seconds
  }
}

// Usage
metricsAdapter.recordCounter('conversions.total', 1, {
  program: program.name,
  partner_tier: partner.tier.name,
});

metricsAdapter.recordTiming('payout.calculation.duration', elapsed, {
  program: program.name,
});
```

## Recipe 6: Customer Data Platform (CDP) Integration

### Segment Integration

```typescript
// Track events to Segment
import { Analytics } from '@segment/analytics-node';

const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

eventBus.on('conversion.recorded', async (event) => {
  analytics.track({
    userId: event.payload.referredUserId,
    event: 'Conversion Recorded',
    properties: {
      programId: event.payload.programId,
      partnerId: event.payload.partnerId,
      amount: event.payload.amount,
      currency: event.payload.currency,
    },
  });
});

eventBus.on('partner.created', async (event) => {
  analytics.group({
    userId: 'system',
    groupId: event.payload.partnerId,
    traits: {
      name: event.payload.name,
      email: event.payload.contactEmail,
      type: 'referral_partner',
    },
  });
});
```

## Recipe 7: Fraud Detection Integration

### Basic Fraud Checks

```typescript
// Fraud detection service
export class FraudDetectionService {
  async checkConversion(conversion: ConversionEvent): Promise<FraudScore> {
    const checks = await Promise.all([
      this.checkIPReputation(conversion),
      this.checkVelocity(conversion),
      this.checkDeviceFingerprint(conversion),
      this.checkReferrerPattern(conversion),
    ]);

    const score = checks.reduce((sum, check) => sum + check.score, 0);

    return {
      score,
      risk: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      checks,
    };
  }

  private async checkVelocity(conversion: ConversionEvent) {
    const recentConversions = await prisma.conversionEvent.count({
      where: {
        partnerId: conversion.partnerId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    return {
      name: 'velocity',
      score: recentConversions > 10 ? 50 : 0,
      details: { count: recentConversions },
    };
  }
}

// Auto-flag suspicious conversions
eventBus.on('conversion.recorded', async (event) => {
  const conversion = await prisma.conversionEvent.findUnique({
    where: { id: event.aggregateId },
  });

  const fraudScore = await fraudDetectionService.checkConversion(conversion);

  if (fraudScore.risk === 'high') {
    await prisma.conversionEvent.update({
      where: { id: conversion.id },
      data: { status: 'PENDING' }, // Hold for review
    });

    await notifyAdmin({
      subject: 'High Fraud Risk Conversion',
      conversion,
      fraudScore,
    });
  }
});
```

## Recipe 8: Data Warehouse Sync

### BigQuery Sync

```typescript
// Sync analytics to BigQuery for advanced reporting
import { BigQuery } from '@google-cloud/bigquery';

export class BigQuerySyncService {
  private bigquery: BigQuery;

  async syncDailyAnalytics(date: Date) {
    const analytics = await prisma.programAnalytics.findMany({
      where: { date },
      include: { program: true },
    });

    const rows = analytics.map((a) => ({
      date: a.date.toISOString(),
      program_id: a.programId,
      program_name: a.program.name,
      total_partners: a.totalPartners,
      active_partners: a.activePartners,
      total_conversions: a.totalConversions,
      total_revenue: a.totalRevenue,
      total_commission: a.totalCommission,
      avg_conversion_value: a.avgConversionValue,
    }));

    await this.bigquery.dataset('analytics').table('program_performance').insert(rows);
  }
}

// Run daily via cron
cron.schedule('0 1 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await bigQuerySync.syncDailyAnalytics(yesterday);
});
```

## Recipe 9: Multi-tenant SaaS Integration

### Tenant Isolation

```typescript
// Add tenantId to all entities
model Program {
  id        String @id
  tenantId  String // Organization/workspace ID
  // ... other fields

  @@index([tenantId])
}

// Middleware for tenant context
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;

    if (tenantId) {
      req['tenantId'] = tenantId;
    }

    next();
  }
}

// Scoped queries
@Get('programs')
async findAll(@Request() req) {
  return this.prisma.program.findMany({
    where: { tenantId: req.tenantId },
  });
}
```

## Recipe 10: Mobile App Integration

### Deep Linking

```typescript
// Handle deep link attribution
@Get('r/:slug')
async handleDeepLink(
  @Param('slug') slug: string,
  @Query('platform') platform: string,
  @Res() res: Response,
) {
  const link = await this.referralLinksService.findBySlug(slug);

  if (!link) {
    return res.status(404).send('Link not found');
  }

  // Record click
  await this.trackingService.recordClick(link.id, {
    platform,
    timestamp: new Date(),
  });

  // Redirect to app or store
  const redirectUrl =
    platform === 'ios'
      ? `myapp://ref/${link.code}`
      : `https://play.google.com/store/apps/details?id=com.myapp&referrer=${link.code}`;

  res.redirect(redirectUrl);
}
```

These recipes provide practical starting points for integrating the Referral & Affiliate Hub into a larger ecosystem. Adapt them to your specific requirements and tech stack.
