# Referral & Affiliate Hub

A production-ready referral and affiliate management system with complete vertical slice implementation, Docker support, and comprehensive testing.

## 🎯 Overview

This system enables businesses to:
- Create and manage referral/affiliate programs with flexible payout structures
- Track conversions through unique referral codes and URLs
- Automatically calculate payouts based on configurable rules
- Manage partners and their payment methods
- Monitor program performance through an admin dashboard

**Phase 2 Status**: ✅ Complete vertical slice with Docker, testing, and seed data

## 🛠️ Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Testing**: Vitest
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose

## 📊 Domain Model

### Core Entities

```
Program (1) ─→ (N) Partner ─→ (N) ReferralLink
   │                 │
   │                 │
   └──→ (N) ConversionEvent
                     │
          Partner ←──┘
             │
             └──→ (N) Payout
```

**Program**: Referral/Affiliate programs with payout configuration
- `configJson`: Percentage, fixed bounty, or tiered rules

**Partner**: Organizations/individuals enrolled in programs
- `payoutMethodJson`: Stripe, PayPal, or bank transfer details

**ReferralLink**: Unique tracking codes and URL slugs

**ConversionEvent**: Successful conversions with amount and metadata

**Payout**: Calculated payouts for specific time periods with status tracking

## 🚀 Getting Started

### Requirements

- Docker & Docker Compose (recommended)
- OR: Node.js 18+, npm 9+, PostgreSQL 15+

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd referral-affiliate-hub
```

2. **Start the entire stack**
```bash
docker compose up -d
```

This will:
- Start PostgreSQL database
- Run database migrations
- Seed demo data
- Start backend API on `http://localhost:3001`
- Start frontend dashboard on `http://localhost:3000`

3. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api

4. **View logs**
```bash
docker compose logs -f
```

5. **Stop the stack**
```bash
docker compose down
```

### Manual Setup (Without Docker)

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and set DATABASE_URL

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env and set NEXT_PUBLIC_API_URL
```

3. **Set up database**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

4. **Start development servers**
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

## 📝 Demo Data & Credentials

After running `db:seed`, you'll have:

### Programs
1. **SaaS Referral Program** - 20% commission
2. **E-commerce Affiliate Program** - Tiered (5%, 8%, 10%)
3. **Fixed Bounty Program** - $50 per signup

### Demo Referral Codes
- `JOHN2024` - SaaS program, 20% commission
- `SARAH2024` - SaaS program, 20% commission
- `TECHBLOG` - E-commerce, tiered commission
- `ACME2024` - Fixed $50 bounty

### Sample Data
- 4 partners with different payout methods
- 8 conversion events
- 3 calculated payouts in different statuses

## 🎬 Example: Complete Vertical Slice

Here's a complete flow from creating a program to receiving a payout:

### 1. Create a Program
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

**Response**: Returns program with ID

### 2. Add a Partner
```bash
POST http://localhost:3001/partners
Content-Type: application/json

{
  "programId": "<program-id-from-step-1>",
  "name": "John Doe",
  "contactEmail": "john@example.com",
  "payoutMethodJson": {
    "type": "stripe",
    "accountId": "acct_123456"
  }
}
```

**Response**: Returns partner with ID

### 3. Create Referral Link
```bash
POST http://localhost:3001/referral-links
Content-Type: application/json

{
  "partnerId": "<partner-id-from-step-2>",
  "code": "JOHN2024",
  "urlSlug": "john-doe"
}
```

**Response**: Returns referral link

### 4. Track Attribution
When a user visits `?ref=JOHN2024`:
```bash
GET http://localhost:3001/tracking/attribution?ref=JOHN2024
```

**Response**: Partner and program information

### 5. Record Conversion
When the referred user makes a purchase:
```bash
POST http://localhost:3001/tracking/conversion
Content-Type: application/json

{
  "partnerId": "<partner-id>",
  "amount": 99.00,
  "referredUserId": "user_001",
  "metaJson": {
    "plan": "pro"
  }
}
```

**Response**: Conversion recorded

### 6. Calculate Payout
```bash
POST http://localhost:3001/payouts/calculate
Content-Type: application/json

{
  "partnerId": "<partner-id>",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z"
}
```

**Response**: Payout of $19.80 (99 × 20%)

### 7. View in Dashboard

Visit `http://localhost:3000/programs` to:
- See all programs
- View program details and partners
- Check conversion stats
- Manage payouts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch --workspace=backend

# Run tests with coverage
npm run test:cov --workspace=backend
```

### Test Coverage

- ✅ Payout calculation logic (percentage, fixed, tiered)
- ✅ Program CRUD operations
- ✅ Partner management
- ✅ Error handling and validation

## 📜 Available Scripts

### Root Level
```bash
npm run dev              # Start both backend and frontend
npm run build            # Build both applications
npm run test             # Run backend tests
npm run lint             # Lint all code
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed demo data
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run setup            # Install deps, migrate, and seed
```

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm test                 # Run tests
npm run lint             # Lint code
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
```

## 🔌 API Endpoints

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
- `GET /tracking/attribution?ref=CODE` - Track by code
- `GET /tracking/r/:slug` - Track by URL slug
- `POST /tracking/conversion` - Record conversion

### Conversions
- `GET /conversions` - List all conversions
- `GET /conversions/stats/:partnerId` - Get stats

### Payouts
- `GET /payouts` - List all payouts
- `POST /payouts/calculate` - Calculate payout
- `GET /payouts/:id` - Get payout details
- `PATCH /payouts/:id` - Update payout status

Full API documentation: http://localhost:3001/api

## 🎨 Payout Configuration Examples

### Percentage-Based
```json
{
  "percentage": 20  // 20% of conversion amount
}
```

### Fixed Bounty
```json
{
  "fixedBounty": 50  // $50 per conversion
}
```

### Tiered
```json
{
  "tiers": [
    { "minAmount": 0, "percentage": 5 },      // 5% for $0-499
    { "minAmount": 500, "percentage": 8 },    // 8% for $500-999
    { "minAmount": 1000, "percentage": 10 }   // 10% for $1000+
  ]
}
```

## 🏗️ Project Structure

```
referral-affiliate-hub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.ts                 # Seed script
│   ├── src/
│   │   ├── common/
│   │   │   └── filters/            # Error handling
│   │   ├── programs/               # Program management
│   │   ├── partners/               # Partner management
│   │   ├── referral-links/         # Link management
│   │   ├── conversions/            # Conversion tracking
│   │   ├── payouts/                # Payout calculation
│   │   ├── tracking/               # Attribution API
│   │   └── main.ts                 # Application entry
│   ├── vitest.config.ts            # Test configuration
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── programs/           # Programs UI
│   │   │   ├── partners/           # Partners UI
│   │   │   └── page.tsx            # Home page
│   │   └── lib/
│   │       └── api.ts              # API client
│   └── Dockerfile
├── docker-compose.yml              # Docker orchestration
└── package.json                    # Monorepo scripts
```

## 🚢 Deployment

### Docker Production Build

```bash
# Build images
docker compose build

# Run in production mode
docker compose up -d
```

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
NODE_ENV=production
```

**Frontend** (`.env`):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🔮 Future Extensions

- [ ] Authentication & authorization (JWT, OAuth)
- [ ] Multi-currency support
- [ ] Real-time notifications for conversions
- [ ] Webhook support for external systems
- [ ] Analytics dashboard with charts
- [ ] Bulk operations for partners
- [ ] CSV export for payouts
- [ ] Email notifications for partners
- [ ] Rate limiting and API keys
- [ ] Stripe Connect integration for payouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## 📄 License

MIT

## 🆘 Support

For issues and questions:
- Check API documentation: http://localhost:3001/api
- Review test files for usage examples
- Open an issue on GitHub
