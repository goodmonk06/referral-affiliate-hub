# Domain Model: Deep Dive

## Overview

The Referral & Affiliate Hub implements a comprehensive domain model for managing partner-driven customer acquisition programs. This document details the domain concepts, relationships, and business rules.

## Core Domain Concepts

### 1. Campaigns

**Purpose**: Organize and group related programs under unified marketing initiatives.

**Use Cases**:
- Seasonal promotions (Q4 Holiday Campaign)
- Geographic expansion (EMEA Launch Campaign)
- Product-specific initiatives (New Product Launch)
- Vertical-specific programs (B2B SaaS Partners)

**Key Attributes**:
- Timebound (optional start/end dates)
- Status lifecycle (DRAFT → ACTIVE → PAUSED → COMPLETED → ARCHIVED)
- Flexible metadata for budget tracking, target metrics
- Can contain multiple programs

**Business Rules**:
- A campaign can exist without programs (planning phase)
- Programs can exist without campaigns (standalone)
- Campaign status doesn't automatically affect program status

### 2. Programs

**Purpose**: Define the rules and terms for a specific referral or affiliate arrangement.

**Types**:
- **REFERRAL**: Existing customers refer new customers
- **AFFILIATE**: External partners promote products/services

**Configuration Options**:
```json
{
  "percentage": 20,              // Percentage of sale amount
  "fixedBounty": 50,             // Fixed amount per conversion
  "tiers": [                     // Volume-based tiers
    { "minAmount": 0, "percentage": 5 },
    { "minAmount": 500, "percentage": 8 },
    { "minAmount": 1000, "percentage": 10 }
  ],
  "recurringCommission": true,   // For subscription models
  "cookieLifetime": 30           // Attribution window in days
}
```

**Business Rules**:
- Must have at least one payout configuration (percentage, fixed, or tiers)
- Can mix configuration types (e.g., fixed bounty + percentage bonus)
- Status changes trigger notifications to enrolled partners
- Deleting a program cascades to all related data

### 3. Partner Tiers

**Purpose**: Create progressive levels of partnership with increasing benefits.

**Tier Progression**:
1. **Bronze** (Entry): Basic features, monthly payouts
2. **Silver** (Growing): Enhanced analytics, weekly payouts, +2.5% bonus
3. **Gold** (Established): Real-time data, daily payouts, +5% bonus
4. **Platinum** (Elite): Custom API, instant payouts, +10% bonus

**Tier Assignment Logic**:
```typescript
function calculateTierEligibility(partner: Partner): Tier {
  const metrics = getPartnerMetrics(partner);

  for (const tier of tiers.sortByLevel('DESC')) {
    if (
      metrics.monthlyConversions >= tier.requirements.minMonthlyConversions &&
      metrics.lifetimeRevenue >= tier.requirements.minLifetimeRevenue
    ) {
      return tier;
    }
  }

  return bronzeTier; // Default
}
```

**Business Rules**:
- Partners can be manually assigned to tiers (override)
- Tier changes trigger notification events
- Bonus percentage applies on top of base commission
- Tier benefits are cumulative (higher tiers get all lower tier benefits)

### 4. Partners

**Purpose**: Represent individuals or organizations enrolled in programs.

**Lifecycle States**:
- **PENDING**: Application submitted, awaiting approval
- **ACTIVE**: Approved and actively promoting
- **INACTIVE**: Temporarily paused (partner request or admin action)
- **SUSPENDED**: Violation of terms, cannot create new links
- **ARCHIVED**: Historical record, no longer active

**Integration Points**:
- Payout method (Stripe Connect, PayPal, Bank Transfer)
- API access via scoped API keys
- Webhook subscriptions for real-time updates
- Tier-based feature access

**Business Rules**:
- Must have valid payout method before first payout
- Can only have links for their enrolled program
- Status changes logged in activity audit
- Suspension freezes new link creation but preserves data

### 5. Referral Links

**Purpose**: Trackable URLs and codes for attribution.

**Tracking Mechanisms**:
- **Code**: Alphanumeric code for query params (?ref=CODE123)
- **URL Slug**: Human-readable path segment (/r/partner-name)

**Features**:
- Click counting
- Expiration dates
- Active/Inactive status toggle
- Metadata for custom tracking

**Attribution Flow**:
```
User clicks link → Cookie set (30-90 days) → User converts →
Conversion attributed to partner → Commission calculated
```

**Business Rules**:
- Codes must be globally unique
- URL slugs must be globally unique
- Inactive links redirect but don't track (for testing)
- Expired links return 410 Gone
- Click count increments on each visit

### 6. Conversion Events

**Purpose**: Record successful referrals with full attribution context.

**Status Lifecycle**:
- **PENDING**: Recorded but awaiting validation
- **APPROVED**: Verified and eligible for commission
- **REJECTED**: Fraudulent or rule violation
- **REVERSED**: Initially approved but later reversed (refund, chargeback)

**Attribution Data**:
- Source URL (where user came from)
- Landing URL (where they landed)
- UTM parameters (campaign tracking)
- IP address & user agent (fraud detection)
- Referral link used

**Business Rules**:
- Amount must be > 0
- Must reference valid program and partner
- Status changes affect payout calculations
- Reversals deduct from future payouts
- Attribution window enforced via cookie lifetime

### 7. Payouts

**Purpose**: Track commission payments to partners.

**Calculation Process**:
```typescript
function calculatePayout(partner, periodStart, periodEnd) {
  const conversions = getApprovedConversions(partner, periodStart, periodEnd);
  const program = partner.program;
  const tier = partner.tier;

  let baseCommission = 0;

  for (const conversion of conversions) {
    baseCommission += calculateCommission(conversion.amount, program.configJson);
  }

  // Apply tier bonus
  const tierBonus = baseCommission * (tier.bonusPercentage / 100);
  const totalPayout = baseCommission + tierBonus;

  return createPayout({
    partnerId: partner.id,
    amount: totalPayout,
    periodStart,
    periodEnd,
    status: 'PENDING'
  });
}
```

**Status Flow**:
```
PENDING → PROCESSING → PAID
         ↓
      FAILED → (retry) → PROCESSING
         ↓
      CANCELLED
```

**Business Rules**:
- Can only calculate once per period per partner
- Reversed conversions deducted from next payout
- Minimum payout threshold (configured per program)
- Payment method validated before processing
- Transaction ID recorded upon success

### 8. Webhooks

**Purpose**: Real-time event notifications to external systems.

**Event Types**:
- `program.created`, `program.updated`, `program.status_changed`
- `partner.created`, `partner.tier_changed`, `partner.status_changed`
- `conversion.recorded`, `conversion.status_changed`
- `payout.calculated`, `payout.status_changed`
- `referral_link.clicked`

**Delivery Guarantees**:
- At-least-once delivery
- Automatic retry with exponential backoff
- Configurable retry count (default: 3)
- Timeout per delivery (default: 30s)
- Signature verification via shared secret

**Business Rules**:
- Failed deliveries retry up to max count
- After max retries, marked as permanently failed
- Webhook can be paused to stop deliveries
- Each event can trigger multiple webhooks
- Delivery history retained for debugging

### 9. Analytics & Reporting

**Aggregation Strategy**:
- Daily snapshots of key metrics per program
- Enables historical trend analysis
- Pre-aggregated for fast dashboard queries

**Key Metrics**:
- Total/Active Partners
- Conversion count and rate
- Revenue and commission totals
- Average conversion value
- Partner performance rankings

**Business Rules**:
- Snapshots generated daily via cron
- Can backfill historical data
- Metrics exclude rejected/reversed conversions
- Tier bonuses included in commission totals

## Domain Events

All significant state changes emit domain events through the EventBus:

```typescript
// Example: Partner tier upgrade
eventBus.publish({
  type: 'partner.tier_changed',
  timestamp: new Date(),
  aggregateId: partner.id,
  payload: {
    partnerId: partner.id,
    oldTierId: 'silver-id',
    newTierId: 'gold-id',
    tierName: 'Gold'
  }
});
```

**Event Handlers**:
- Webhooks (external notifications)
- Activity logs (audit trail)
- Email notifications
- Analytics updates
- Cache invalidation

## Extension Points

### Custom Payout Rules

Implement `IPayoutRulePlugin`:
```typescript
interface IPayoutRulePlugin {
  name: string;
  calculate(conversion: Conversion, config: any): number;
}
```

### Notification Adapters

Implement `INotificationAdapter`:
```typescript
interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
```

Providers: Email (SendGrid, AWS SES), SMS (Twilio), Push (FCM), Slack

### Metrics Adapters

Implement `IMetricsAdapter`:
```typescript
interface IMetricsAdapter {
  recordCounter(name: string, value: number, labels?: MetricLabels): void;
  recordGauge(name: string, value: number, labels?: MetricLabels): void;
}
```

Backends: Prometheus, StatsD, Cloudwatch, Datadog

## Common Patterns

### Soft Delete

Entities use status flags instead of hard deletion:
- Partners: ARCHIVED
- Programs: ARCHIVED
- Campaigns: ARCHIVED
- Links: INACTIVE

Preserves historical data and audit trail.

### Polymorphic Relations

Notes and Tags use polymorphic pattern:
```typescript
note: {
  entityType: 'Partner',
  entityId: 'uuid',
  content: 'Note text'
}
```

Allows attaching to any entity type.

### Optimistic Locking

Critical updates use version fields:
```typescript
await prisma.payout.update({
  where: {
    id: payoutId,
    updatedAt: currentVersion // Prevents concurrent modification
  },
  data: { status: 'PAID' }
});
```

### Idempotency

Payout calculations and webhook deliveries are idempotent:
- Same period = same result
- Deduplication via unique constraints
- Retry-safe operations

## Future Extensions

1. **Multi-currency Support**: Convert all amounts to base currency
2. **Geo-targeting**: Region-specific programs and payouts
3. **A/B Testing**: Variant commission structures
4. **Fraud Detection**: ML-based anomaly detection
5. **White-label**: Partner-branded portals
6. **Revenue Sharing**: Split commissions across multiple partners
7. **Product Catalogs**: Link commissions to specific products
8. **Cohort Analysis**: Partner segment performance
