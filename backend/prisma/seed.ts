import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payout.deleteMany();
  await prisma.conversionEvent.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.program.deleteMany();

  // Create Programs
  const saasProgram = await prisma.program.create({
    data: {
      name: 'SaaS Referral Program',
      type: 'REFERRAL',
      configJson: {
        percentage: 20,
      },
    },
  });

  const ecommerceProgram = await prisma.program.create({
    data: {
      name: 'E-commerce Affiliate Program',
      type: 'AFFILIATE',
      configJson: {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 500, percentage: 8 },
          { minAmount: 1000, percentage: 10 },
        ],
      },
    },
  });

  const fixedBountyProgram = await prisma.program.create({
    data: {
      name: 'Fixed Bounty Program',
      type: 'REFERRAL',
      configJson: {
        fixedBounty: 50,
      },
    },
  });

  console.log('✅ Created 3 programs');

  // Create Partners for SaaS Program
  const johnPartner = await prisma.partner.create({
    data: {
      programId: saasProgram.id,
      name: 'John Doe',
      contactEmail: 'john@example.com',
      payoutMethodJson: {
        type: 'stripe',
        accountId: 'acct_john123',
      },
    },
  });

  const sarahPartner = await prisma.partner.create({
    data: {
      programId: saasProgram.id,
      name: 'Sarah Johnson',
      contactEmail: 'sarah@example.com',
      payoutMethodJson: {
        type: 'paypal',
        accountId: 'sarah@paypal.com',
      },
    },
  });

  // Create Partners for E-commerce Program
  const techBloggerPartner = await prisma.partner.create({
    data: {
      programId: ecommerceProgram.id,
      name: 'TechBlogger Pro',
      contactEmail: 'blogger@techpro.com',
      payoutMethodJson: {
        type: 'stripe',
        accountId: 'acct_techblogger456',
      },
    },
  });

  // Create Partner for Fixed Bounty Program
  const acmePartner = await prisma.partner.create({
    data: {
      programId: fixedBountyProgram.id,
      name: 'Acme Corporation',
      contactEmail: 'partner@acme.com',
      payoutMethodJson: {
        type: 'bank',
        accountId: 'BANK-123456789',
        bankName: 'First National Bank',
      },
    },
  });

  console.log('✅ Created 4 partners');

  // Create Referral Links
  const johnLink = await prisma.referralLink.create({
    data: {
      partnerId: johnPartner.id,
      code: 'JOHN2024',
      urlSlug: 'john-doe',
    },
  });

  const sarahLink = await prisma.referralLink.create({
    data: {
      partnerId: sarahPartner.id,
      code: 'SARAH2024',
      urlSlug: 'sarah-johnson',
    },
  });

  const techBloggerLink = await prisma.referralLink.create({
    data: {
      partnerId: techBloggerPartner.id,
      code: 'TECHBLOG',
      urlSlug: 'techblogger',
    },
  });

  const acmeLink = await prisma.referralLink.create({
    data: {
      partnerId: acmePartner.id,
      code: 'ACME2024',
      urlSlug: 'acme-corp',
    },
  });

  console.log('✅ Created 4 referral links');

  // Create Conversion Events for John (SaaS)
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  await prisma.conversionEvent.createMany({
    data: [
      {
        programId: saasProgram.id,
        partnerId: johnPartner.id,
        referredUserId: 'user_001',
        amount: 99.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
        metaJson: {
          plan: 'pro',
          billingCycle: 'monthly',
        },
      },
      {
        programId: saasProgram.id,
        partnerId: johnPartner.id,
        referredUserId: 'user_002',
        amount: 99.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
        metaJson: {
          plan: 'pro',
          billingCycle: 'monthly',
        },
      },
      {
        programId: saasProgram.id,
        partnerId: johnPartner.id,
        referredUserId: 'user_003',
        amount: 199.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
        metaJson: {
          plan: 'enterprise',
          billingCycle: 'monthly',
        },
      },
    ],
  });

  // Create Conversion Events for TechBlogger (E-commerce)
  await prisma.conversionEvent.createMany({
    data: [
      {
        programId: ecommerceProgram.id,
        partnerId: techBloggerPartner.id,
        referredUserId: 'customer_001',
        amount: 250.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
        metaJson: {
          orderId: 'ORD-001',
          products: ['Laptop Stand', 'Wireless Mouse'],
        },
      },
      {
        programId: ecommerceProgram.id,
        partnerId: techBloggerPartner.id,
        referredUserId: 'customer_002',
        amount: 400.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 12 * 24 * 60 * 60 * 1000),
        metaJson: {
          orderId: 'ORD-002',
          products: ['Mechanical Keyboard'],
        },
      },
      {
        programId: ecommerceProgram.id,
        partnerId: techBloggerPartner.id,
        referredUserId: 'customer_003',
        amount: 600.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 18 * 24 * 60 * 60 * 1000),
        metaJson: {
          orderId: 'ORD-003',
          products: ['Monitor', 'HDMI Cable'],
        },
      },
    ],
  });

  // Create Conversion Events for Acme (Fixed Bounty)
  await prisma.conversionEvent.createMany({
    data: [
      {
        programId: fixedBountyProgram.id,
        partnerId: acmePartner.id,
        referredUserId: 'signup_001',
        amount: 50.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        metaJson: {
          signupType: 'trial',
        },
      },
      {
        programId: fixedBountyProgram.id,
        partnerId: acmePartner.id,
        referredUserId: 'signup_002',
        amount: 50.0,
        currency: 'USD',
        occurredAt: new Date(lastMonth.getTime() + 20 * 24 * 60 * 60 * 1000),
        metaJson: {
          signupType: 'trial',
        },
      },
    ],
  });

  console.log('✅ Created conversion events');

  // Create a Payout for John (calculated for last month)
  // John's conversions: $99 + $99 + $199 = $397
  // Commission: $397 * 20% = $79.40
  await prisma.payout.create({
    data: {
      partnerId: johnPartner.id,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      amount: 79.4,
      currency: 'USD',
      status: 'PENDING',
    },
  });

  // Create a Payout for TechBlogger
  // Conversions: $250 (5%) + $400 (5%) + $600 (8%) = $12.50 + $20 + $48 = $80.50
  await prisma.payout.create({
    data: {
      partnerId: techBloggerPartner.id,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      amount: 80.5,
      currency: 'USD',
      status: 'PROCESSING',
    },
  });

  // Create a Payout for Acme (Fixed Bounty)
  // 2 signups * $50 = $100
  await prisma.payout.create({
    data: {
      partnerId: acmePartner.id,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      amount: 100.0,
      currency: 'USD',
      status: 'PAID',
    },
  });

  console.log('✅ Created payouts');

  console.log('\n📊 Seed Summary:');
  console.log('  - Programs: 3 (SaaS Referral, E-commerce Affiliate, Fixed Bounty)');
  console.log('  - Partners: 4 (John, Sarah, TechBlogger, Acme)');
  console.log('  - Referral Links: 4');
  console.log('  - Conversions: 8');
  console.log('  - Payouts: 3');
  console.log('\n🔗 Demo Referral Codes:');
  console.log('  - JOHN2024 (SaaS, 20% commission)');
  console.log('  - SARAH2024 (SaaS, 20% commission)');
  console.log('  - TECHBLOG (E-commerce, tiered commission)');
  console.log('  - ACME2024 (Fixed $50 bounty)');
  console.log('\n✨ Database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
