# Referral & Affiliate Hub

A complete referral and affiliate management system built with NestJS, Prisma, PostgreSQL, and Next.js. Track referrals, manage conversions, and calculate payouts with configurable rules.

## Features

- **Referral & Affiliate Programs**: Create and manage multiple programs with different payout structures
- **Partner Management**: Onboard partners with custom payout methods
- **Referral Link Tracking**: Generate unique referral codes and URL slugs
- **Conversion Tracking**: Record and track conversions with detailed metadata
- **Automated Payout Calculation**: Support for percentage, fixed bounty, and tier-based payouts
- **Admin Dashboard**: Full-featured UI for managing programs, partners, and payouts
- **REST API**: Complete API with Swagger documentation

## Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 with App Router + TypeScript + Tailwind CSS
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
referral-affiliate-hub/
├── backend/           # NestJS backend API
│   ├── prisma/        # Database schema and migrations
│   └── src/           # Source code
│       ├── programs/     # Program management
│       ├── partners/     # Partner management
│       ├── referral-links/ # Referral link management
│       ├── conversions/  # Conversion tracking
│       ├── payouts/      # Payout calculation
│       └── tracking/     # Attribution and conversion API
└── frontend/          # Next.js admin dashboard
    └── src/
        ├── app/       # Pages and routes
        └── lib/       # API client
```

## Database Schema

### Program
- Stores referral/affiliate program information
- Configurable payout rules (percentage, fixed bounty, tiers)

### Partner
- Partners enrolled in programs
- Payout method configuration (Stripe, PayPal, bank transfer)

### ReferralLink
- Unique referral codes and URL slugs
- Linked to specific partners

### ConversionEvent
- Tracks successful conversions
- Stores conversion amount and metadata

### Payout
- Calculated payouts for specific time periods
- Status tracking (PENDING, PROCESSING, PAID, FAILED)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/referral_affiliate_hub?schema=public"
PORT=3001
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Start the backend:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`
API Documentation: `http://localhost:3001/api`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3000`

## Usage Examples

### 1. Subscription SaaS Referrals

**Scenario**: You run a SaaS with monthly subscriptions at $99/month. You want to give existing customers 20% of the first payment when they refer new customers.

#### Step 1: Create a Program

```bash
POST http://localhost:3001/programs
Content-Type: application/json

{
  "name": "SaaS Referral Program",
  "type": "REFERRAL",
  "configJson": {
    "percentage": 20
  }
}
```

Or use the Admin UI: Go to `/programs` → "Create Program"

#### Step 2: Add Partners

Partners are your existing customers who will refer new users.

```bash
POST http://localhost:3001/partners
Content-Type: application/json

{
  "programId": "program-uuid-here",
  "name": "John Doe",
  "contactEmail": "john@example.com",
  "payoutMethodJson": {
    "type": "stripe",
    "accountId": "acct_123456"
  }
}
```

Or use the Admin UI: Go to `/programs/[id]` → "Add Partner"

#### Step 3: Generate Referral Links

```bash
POST http://localhost:3001/referral-links
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "code": "JOHN2024",
  "urlSlug": "john-doe"
}
```

Share with partner:
- Query param: `https://yoursite.com/signup?ref=JOHN2024`
- Short URL: `https://yoursite.com/r/john-doe`

#### Step 4: Track Attribution

When a user visits with the referral link, call:

```bash
GET http://localhost:3001/tracking/attribution?ref=JOHN2024
```

Store the returned `partnerId` in your session/cookie.

#### Step 5: Record Conversion

When the referred user completes signup and pays $99:

```bash
POST http://localhost:3001/tracking/conversion
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "amount": 99.00,
  "referredUserId": "new-user-id",
  "metaJson": {
    "plan": "pro",
    "billingCycle": "monthly"
  }
}
```

#### Step 6: Calculate Payout

At the end of the month, calculate payouts:

```bash
POST http://localhost:3001/payouts/calculate
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z"
}
```

This will calculate: $99 × 20% = $19.80 payout

Or use the Admin UI: Go to `/partners/[id]` → "Calculate Payout"

### 2. E-commerce Affiliate Program

**Scenario**: You run an online store. Affiliates get a tiered commission based on sales volume.

#### Step 1: Create Tiered Program

```bash
POST http://localhost:3001/programs
Content-Type: application/json

{
  "name": "E-commerce Affiliate Program",
  "type": "AFFILIATE",
  "configJson": {
    "tiers": [
      {
        "minAmount": 0,
        "percentage": 5
      },
      {
        "minAmount": 500,
        "percentage": 8
      },
      {
        "minAmount": 1000,
        "percentage": 10
      }
    ]
  }
}
```

**How it works**:
- Sales $0-499: 5% commission
- Sales $500-999: 8% commission
- Sales $1000+: 10% commission

#### Step 2: Add Affiliate Partner

```bash
POST http://localhost:3001/partners
Content-Type: application/json

{
  "programId": "program-uuid-here",
  "name": "TechBlogger Pro",
  "contactEmail": "blogger@example.com",
  "payoutMethodJson": {
    "type": "paypal",
    "accountId": "blogger@paypal.com"
  }
}
```

#### Step 3: Create Affiliate Link

```bash
POST http://localhost:3001/referral-links
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "code": "TECHBLOG",
  "urlSlug": "techblogger"
}
```

#### Step 4: Track Product Purchases

When a customer buys through the affiliate link:

```bash
POST http://localhost:3001/tracking/conversion
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "amount": 250.00,
  "referredUserId": "customer-123",
  "metaJson": {
    "orderId": "ORD-456",
    "products": ["Product A", "Product B"]
  }
}
```

#### Step 5: Monthly Payout Calculation

If the affiliate generated 3 sales: $250, $400, $600 = $1,250 total:

```bash
POST http://localhost:3001/payouts/calculate
Content-Type: application/json

{
  "partnerId": "partner-uuid-here",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z"
}
```

**Calculation**:
- $250: 5% tier = $12.50
- $400: 5% tier = $20.00
- $600: 8% tier (crossed $500) = $48.00
- **Total payout**: $80.50

### 3. Fixed Bounty Referrals

**Scenario**: Pay $50 for every qualified signup, regardless of purchase amount.

```bash
POST http://localhost:3001/programs
Content-Type: application/json

{
  "name": "Fixed Bounty Program",
  "type": "REFERRAL",
  "configJson": {
    "fixedBounty": 50
  }
}
```

Each conversion will result in exactly $50 payout.

## API Endpoints

### Programs
- `GET /programs` - List all programs
- `POST /programs` - Create program
- `GET /programs/:id` - Get program details
- `PATCH /programs/:id` - Update program
- `DELETE /programs/:id` - Delete program

### Partners
- `GET /partners` - List all partners
- `POST /partners` - Create partner
- `GET /partners/:id` - Get partner details
- `PATCH /partners/:id` - Update partner
- `DELETE /partners/:id` - Delete partner

### Referral Links
- `GET /referral-links` - List all links
- `POST /referral-links` - Create link
- `DELETE /referral-links/:id` - Delete link

### Tracking
- `GET /tracking/attribution?ref=CODE` - Track by referral code
- `GET /tracking/r/:slug` - Track by URL slug
- `POST /tracking/conversion` - Record conversion

### Conversions
- `GET /conversions` - List all conversions
- `GET /conversions/:id` - Get conversion details
- `GET /conversions/stats/:partnerId` - Get partner stats

### Payouts
- `GET /payouts` - List all payouts
- `POST /payouts/calculate` - Calculate payout for period
- `GET /payouts/:id` - Get payout details
- `PATCH /payouts/:id` - Update payout status

## Payout Configuration Options

### Percentage-based
```json
{
  "percentage": 20
}
```

### Fixed Bounty
```json
{
  "fixedBounty": 50
}
```

### Tiered
```json
{
  "tiers": [
    { "minAmount": 0, "percentage": 5 },
    { "minAmount": 500, "percentage": 8 },
    { "minAmount": 1000, "fixedBounty": 100 }
  ]
}
```

### Hybrid (Percentage + Fixed)
```json
{
  "percentage": 10,
  "fixedBounty": 25
}
```
This will give both 10% of sale + $25 fixed bonus.

## Integration Guide

### 1. Frontend Integration

Add referral tracking to your app:

```typescript
// When user visits with ?ref=CODE
const ref = new URLSearchParams(window.location.search).get('ref');
if (ref) {
  const response = await fetch(
    `http://localhost:3001/tracking/attribution?ref=${ref}`
  );
  const data = await response.json();

  // Store partnerId in cookie/localStorage
  localStorage.setItem('referralPartnerId', data.partner.id);
}
```

### 2. Backend Integration

When a conversion happens:

```typescript
const partnerId = getUserReferralPartner(userId);
if (partnerId) {
  await fetch('http://localhost:3001/tracking/conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerId,
      amount: orderTotal,
      referredUserId: userId,
      metaJson: {
        orderId: order.id,
        // ... additional data
      }
    })
  });
}
```

### 3. Webhook Integration (Stripe Example)

```typescript
// Handle Stripe webhook
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const partnerId = session.metadata.referralPartnerId;

    if (partnerId) {
      await fetch('http://localhost:3001/tracking/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          amount: session.amount_total / 100,
          referredUserId: session.customer,
          metaJson: {
            stripeSessionId: session.id
          }
        })
      });
    }
  }

  res.json({ received: true });
});
```

## Admin Dashboard

Access the admin dashboard at `http://localhost:3000`

**Features**:
- View all programs and their performance
- Manage partners and their referral links
- Calculate and track payouts
- Update payout statuses (Pending → Processing → Paid)

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Database Migrations

```bash
cd backend

# Create migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio
```

### API Documentation

Start the backend and visit: `http://localhost:3001/api`

## Production Deployment

### Backend

1. Set production environment variables
2. Run migrations: `npm run prisma:migrate`
3. Build: `npm run build`
4. Start: `npm run start:prod`

### Frontend

1. Set `NEXT_PUBLIC_API_URL` to production API
2. Build: `npm run build`
3. Start: `npm start`

### Docker (Optional)

```bash
# Build and run with docker-compose
docker-compose up -d
```

## Security Considerations

- Always validate referral codes server-side
- Implement rate limiting on conversion endpoints
- Use authentication for admin endpoints
- Sanitize user inputs
- Use HTTPS in production
- Store payout credentials securely (consider using encryption)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
