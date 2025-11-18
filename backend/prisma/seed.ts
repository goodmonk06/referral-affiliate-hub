import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Phase 3 comprehensive data...\n');

  // Clear existing data in correct order
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.partnerApiKey.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.programAnalytics.deleteMany();
  await prisma.conversionAttribution.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.conversionEvent.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.partnerTier.deleteMany();
  await prisma.program.deleteMany();
  await prisma.campaign.deleteMany();

  console.log('✅ Cleared existing data\n');

  // ============================================================================
  // 1. CREATE CAMPAIGNS
  // ============================================================================

  const q4Campaign = await prisma.campaign.create({
    data: {
      name: 'Q4 2024 Growth Campaign',
      description: 'Aggressive growth push for holiday season',
      status: 'ACTIVE',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      metadata: {
        budget: 100000,
        targetRevenue: 500000,
        regions: ['US', 'EU', 'APAC'],
      },
    },
  });

  const sustainabilityCampaign = await prisma.campaign.create({
    data: {
      name: 'Sustainability Partners Program',
      description: 'Partner with eco-conscious brands',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      metadata: {
        focus: 'sustainability',
        certifications: ['B-Corp', 'Carbon-Neutral'],
      },
    },
  });

  console.log('✅ Created 2 campaigns');

  // ============================================================================
  // 2. CREATE PARTNER TIERS
  // ============================================================================

  const bronzeTier = await prisma.partnerTier.create({
    data: {
      name: 'Bronze',
      level: 1,
      benefits: {
        description: 'Entry level tier for new partners',
        features: ['Basic dashboard', 'Email support', 'Monthly payouts'],
      },
      requirements: {
        minMonthlyConversions: 0,
        minLifetimeRevenue: 0,
      },
      bonusPercentage: 0,
    },
  });

  const silverTier = await prisma.partnerTier.create({
    data: {
      name: 'Silver',
      level: 2,
      benefits: {
        description: 'Mid-level tier with additional perks',
        features: [
          'Advanced analytics',
          'Priority support',
          'Weekly payouts',
          'Marketing materials',
        ],
      },
      requirements: {
        minMonthlyConversions: 10,
        minLifetimeRevenue: 5000,
      },
      bonusPercentage: 2.5,
    },
  });

  const goldTier = await prisma.partnerTier.create({
    data: {
      name: 'Gold',
      level: 3,
      benefits: {
        description: 'Premium tier for top performers',
        features: [
          'Real-time analytics',
          'Dedicated account manager',
          'Daily payouts',
          'Co-marketing opportunities',
          'Early access to new programs',
        ],
      },
      requirements: {
        minMonthlyConversions: 50,
        minLifetimeRevenue: 25000,
      },
      bonusPercentage: 5,
    },
  });

  const platinumTier = await prisma.partnerTier.create({
    data: {
      name: 'Platinum',
      level: 4,
      benefits: {
        description: 'Elite tier for super affiliates',
        features: [
          'Custom API access',
          'White-label solutions',
          'Instant payouts',
          'Revenue share opportunities',
          'Exclusive partnership events',
        ],
      },
      requirements: {
        minMonthlyConversions: 200,
        minLifetimeRevenue: 100000,
      },
      bonusPercentage: 10,
    },
  });

  console.log('✅ Created 4 partner tiers');

  // ============================================================================
  // 3. CREATE PROGRAMS
  // ============================================================================

  const saasProgram = await prisma.program.create({
    data: {
      campaignId: q4Campaign.id,
      name: 'SaaS Referral Program',
      description: 'Refer customers to our SaaS platform',
      type: 'REFERRAL',
      status: 'ACTIVE',
      configJson: {
        percentage: 20,
        recurringCommission: true,
        cookieLifetime: 30,
      },
      terms: 'Standard referral terms apply. Commission paid on first 12 months of subscription.',
      metadata: {
        vertical: 'B2B SaaS',
        avgContractValue: 1200,
      },
    },
  });

  const ecommerceProgram = await prisma.program.create({
    data: {
      campaignId: q4Campaign.id,
      name: 'E-commerce Affiliate Program',
      description: 'Tiered commission for product sales',
      type: 'AFFILIATE',
      status: 'ACTIVE',
      configJson: {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 500, percentage: 8 },
          { minAmount: 1000, percentage: 10 },
          { minAmount: 5000, percentage: 12 },
        ],
        cookieLifetime: 60,
      },
      terms: 'Commission paid on completed orders only. Returns deducted from future payouts.',
    },
  });

  const sustainabilityProgram = await prisma.program.create({
    data: {
      campaignId: sustainabilityCampaign.id,
      name: 'Eco-Products Bounty Program',
      description: 'Fixed bounty for sustainable product sales',
      type: 'AFFILIATE',
      status: 'ACTIVE',
      configJson: {
        fixedBounty: 50,
        bonusForCertified: 25,
      },
    },
  });

  const influencerProgram = await prisma.program.create({
    data: {
      name: 'Influencer Partnership Program',
      description: 'Custom deals for social media influencers',
      type: 'AFFILIATE',
      status: 'ACTIVE',
      configJson: {
        percentage: 15,
        minimumFollowers: 10000,
      },
    },
  });

  console.log('✅ Created 4 programs');

  // ============================================================================
  // 4. CREATE PARTNERS
  // ============================================================================

  const johnPartner = await prisma.partner.create({
    data: {
      programId: saasProgram.id,
      tierId: goldTier.id,
      name: 'John Doe Digital',
      contactEmail: 'john@digital.com',
      status: 'ACTIVE',
      payoutMethodJson: {
        type: 'stripe',
        accountId: 'acct_john123',
        preferred: true,
      },
      metadata: {
        website: 'https://johndoe.digital',
        niche: 'B2B Marketing',
        traffic: 50000,
      },
    },
  });

  const sarahPartner = await prisma.partner.create({
    data: {
      programId: saasProgram.id,
      tierId: silverTier.id,
      name: 'Sarah Johnson Consulting',
      contactEmail: 'sarah@consulting.com',
      status: 'ACTIVE',
      payoutMethodJson: {
        type: 'paypal',
        accountId: 'sarah@paypal.com',
      },
      metadata: {
        company: 'SJ Consulting LLC',
        specialization: 'Enterprise SaaS',
      },
    },
  });

  const techBloggerPartner = await prisma.partner.create({
    data: {
      programId: ecommerceProgram.id,
      tierId: platinumTier.id,
      name: 'TechBlogger Pro',
      contactEmail: 'admin@techblogger.pro',
      status: 'ACTIVE',
      payoutMethodJson: {
        type: 'stripe',
        accountId: 'acct_techblog456',
      },
      metadata: {
        website: 'https://techblogger.pro',
        monthlyVisitors: 500000,
        engagement: 'high',
      },
    },
  });

  const ecoInfluencer = await prisma.partner.create({
    data: {
      programId: sustainabilityProgram.id,
      tierId: goldTier.id,
      name: 'Eco Lifestyle Influencer',
      contactEmail: 'contact@ecolife.social',
      status: 'ACTIVE',
      payoutMethodJson: {
        type: 'bank',
        accountId: 'BANK-ECO-123',
        bankName: 'Green Bank',
      },
      metadata: {
        instagram: '@ecolifestyle',
        followers: 150000,
        engagementRate: 4.2,
      },
    },
  });

  const newPartner = await prisma.partner.create({
    data: {
      programId: influencerProgram.id,
      tierId: bronzeTier.id,
      name: 'Rising Star Media',
      contactEmail: 'hello@risingstar.media',
      status: 'PENDING',
      payoutMethodJson: {
        type: 'paypal',
        accountId: 'rising@paypal.com',
      },
    },
  });

  console.log('✅ Created 5 partners');

  // ============================================================================
  // 5. CREATE REFERRAL LINKS
  // ============================================================================

  const referralLinks = await prisma.referralLink.createMany({
    data: [
      {
        partnerId: johnPartner.id,
        code: 'JOHN2024',
        urlSlug: 'john-digital',
        status: 'ACTIVE',
        clickCount: 245,
      },
      {
        partnerId: sarahPartner.id,
        code: 'SARAH2024',
        urlSlug: 'sarah-consulting',
        status: 'ACTIVE',
        clickCount: 89,
      },
      {
        partnerId: techBloggerPartner.id,
        code: 'TECHBLOG',
        urlSlug: 'tech-blogger-pro',
        status: 'ACTIVE',
        clickCount: 1823,
      },
      {
        partnerId: ecoInfluencer.id,
        code: 'ECOLIFE2024',
        urlSlug: 'eco-lifestyle',
        status: 'ACTIVE',
        clickCount: 567,
      },
      {
        partnerId: newPartner.id,
        code: 'RISING',
        urlSlug: 'rising-star',
        status: 'INACTIVE',
        clickCount: 12,
      },
    ],
  });

  console.log('✅ Created 5 referral links');

  // ============================================================================
  // 6. CREATE CONVERSIONS & ATTRIBUTIONS
  // ============================================================================

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Get referral link IDs
  const johnLink = await prisma.referralLink.findUnique({
    where: { code: 'JOHN2024' },
  });
  const techLink = await prisma.referralLink.findUnique({
    where: { code: 'TECHBLOG' },
  });
  const ecoLink = await prisma.referralLink.findUnique({
    where: { code: 'ECOLIFE2024' },
  });

  // John's conversions (SaaS)
  for (let i = 0; i < 12; i++) {
    const conv = await prisma.conversionEvent.create({
      data: {
        programId: saasProgram.id,
        partnerId: johnPartner.id,
        referredUserId: `user_john_${i + 1}`,
        amount: [99, 199, 299][Math.floor(Math.random() * 3)],
        currency: 'USD',
        status: 'APPROVED',
        occurredAt: new Date(lastMonth.getTime() + i * 2 * 24 * 60 * 60 * 1000),
        metaJson: {
          plan: ['starter', 'pro', 'enterprise'][Math.floor(Math.random() * 3)],
        },
      },
    });

    await prisma.conversionAttribution.create({
      data: {
        conversionId: conv.id,
        referralLinkId: johnLink!.id,
        sourceUrl: 'https://google.com',
        landingUrl: 'https://example.com/pricing',
        utmSource: 'john-digital',
        utmMedium: 'referral',
        utmCampaign: 'q4-2024',
      },
    });
  }

  // TechBlogger conversions (E-commerce)
  for (let i = 0; i < 25; i++) {
    const amount = Math.random() * 2000 + 100;
    const conv = await prisma.conversionEvent.create({
      data: {
        programId: ecommerceProgram.id,
        partnerId: techBloggerPartner.id,
        referredUserId: `customer_tech_${i + 1}`,
        amount,
        currency: 'USD',
        status: 'APPROVED',
        occurredAt: new Date(lastMonth.getTime() + i * 24 * 60 * 60 * 1000),
        metaJson: {
          orderId: `ORD-TECH-${1000 + i}`,
          items: Math.floor(Math.random() * 5) + 1,
        },
      },
    });

    await prisma.conversionAttribution.create({
      data: {
        conversionId: conv.id,
        referralLinkId: techLink!.id,
        sourceUrl: 'https://techblogger.pro/review',
        landingUrl: 'https://example.com/products',
        utmSource: 'techblogger',
        utmMedium: 'content',
        utmCampaign: 'product-review',
      },
    });
  }

  // Eco Influencer conversions
  for (let i = 0; i < 8; i++) {
    const conv = await prisma.conversionEvent.create({
      data: {
        programId: sustainabilityProgram.id,
        partnerId: ecoInfluencer.id,
        referredUserId: `eco_customer_${i + 1}`,
        amount: 150,
        currency: 'USD',
        status: 'APPROVED',
        occurredAt: new Date(lastMonth.getTime() + i * 3 * 24 * 60 * 60 * 1000),
        metaJson: {
          productCategory: 'sustainable-products',
          certified: true,
        },
      },
    });

    await prisma.conversionAttribution.create({
      data: {
        conversionId: conv.id,
        referralLinkId: ecoLink!.id,
        sourceUrl: 'https://instagram.com',
        landingUrl: 'https://example.com/eco',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'eco-lifestyle',
      },
    });
  }

  console.log('✅ Created 45+ conversion events with attribution');

  // ============================================================================
  // 7. CREATE PAYOUTS
  // ============================================================================

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  await prisma.payout.createMany({
    data: [
      {
        partnerId: johnPartner.id,
        periodStart: lastMonthStart,
        periodEnd: lastMonthEnd,
        amount: 385.8, // Calculated from conversions
        currency: 'USD',
        status: 'PAID',
        processedAt: new Date(),
        transactionId: 'txn_john_202411',
        processingNote: 'Paid via Stripe Connect',
      },
      {
        partnerId: techBloggerPartner.id,
        periodStart: lastMonthStart,
        periodEnd: lastMonthEnd,
        amount: 2847.5,
        currency: 'USD',
        status: 'PROCESSING',
        processingNote: 'Queued for batch processing',
      },
      {
        partnerId: ecoInfluencer.id,
        periodStart: lastMonthStart,
        periodEnd: lastMonthEnd,
        amount: 600, // 8 * ($50 + $25 bonus)
        currency: 'USD',
        status: 'PENDING',
      },
    ],
  });

  console.log('✅ Created 3 payouts');

  // ============================================================================
  // 8. CREATE PARTNER API KEYS
  // ============================================================================

  await prisma.partnerApiKey.createMany({
    data: [
      {
        partnerId: johnPartner.id,
        name: 'Production API Key',
        key: 'pk_live_john_' + Math.random().toString(36).substring(2),
        status: 'ACTIVE',
        permissions: ['read:conversions', 'read:payouts'],
        lastUsedAt: new Date(),
      },
      {
        partnerId: techBloggerPartner.id,
        name: 'Analytics Dashboard',
        key: 'pk_live_tech_' + Math.random().toString(36).substring(2),
        status: 'ACTIVE',
        permissions: ['read:conversions', 'read:analytics', 'write:conversions'],
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created 2 API keys');

  // ============================================================================
  // 9. CREATE WEBHOOKS
  // ============================================================================

  const webhook1 = await prisma.webhook.create({
    data: {
      name: 'Conversion Notifications',
      url: 'https://example.com/webhooks/conversions',
      events: ['conversion.recorded', 'conversion.status_changed'],
      status: 'ACTIVE',
      secret: 'whsec_' + Math.random().toString(36).substring(2),
      retryCount: 3,
    },
  });

  const webhook2 = await prisma.webhook.create({
    data: {
      name: 'Payout Updates',
      url: 'https://example.com/webhooks/payouts',
      events: ['payout.calculated', 'payout.status_changed'],
      status: 'ACTIVE',
      secret: 'whsec_' + Math.random().toString(36).substring(2),
    },
  });

  // Create some webhook deliveries
  await prisma.webhookDelivery.createMany({
    data: [
      {
        webhookId: webhook1.id,
        eventType: 'conversion.recorded',
        payload: { test: 'data' },
        status: 'SUCCESS',
        attempts: 1,
        lastAttemptAt: new Date(),
        responseStatus: 200,
        completedAt: new Date(),
      },
      {
        webhookId: webhook2.id,
        eventType: 'payout.calculated',
        payload: { test: 'data' },
        status: 'FAILED',
        attempts: 3,
        lastAttemptAt: new Date(),
        responseStatus: 500,
        errorMessage: 'Internal Server Error',
      },
    ],
  });

  console.log('✅ Created 2 webhooks with delivery logs');

  // ============================================================================
  // 10. CREATE ACTIVITY LOGS
  // ============================================================================

  await prisma.activityLog.createMany({
    data: [
      {
        entityType: 'Program',
        entityId: saasProgram.id,
        action: 'created',
        actorType: 'user',
        actorId: 'admin_1',
        changes: { status: 'ACTIVE' },
      },
      {
        entityType: 'Partner',
        entityId: johnPartner.id,
        action: 'tier_upgraded',
        actorType: 'system',
        changes: { oldTier: 'Silver', newTier: 'Gold' },
      },
      {
        entityType: 'Payout',
        entityId: 'payout_1',
        action: 'status_changed',
        actorType: 'system',
        changes: { oldStatus: 'PENDING', newStatus: 'PAID' },
      },
    ],
  });

  console.log('✅ Created activity logs');

  // ============================================================================
  // 11. CREATE NOTES
  // ============================================================================

  await prisma.note.createMany({
    data: [
      {
        entityType: 'Partner',
        entityId: johnPartner.id,
        content: 'Excellent performance. Consider offering custom deal for Q1 2025.',
        authorType: 'user',
        authorId: 'manager_1',
        isInternal: true,
      },
      {
        entityType: 'Program',
        entityId: ecommerceProgram.id,
        content: 'Increase tier 3 commission to 12% starting next month.',
        authorType: 'user',
        authorId: 'admin_1',
        isInternal: true,
      },
    ],
  });

  console.log('✅ Created notes');

  // ============================================================================
  // 12. CREATE PROGRAM ANALYTICS
  // ============================================================================

  const analyticsDate = new Date(lastMonthStart);
  await prisma.programAnalytics.createMany({
    data: [
      {
        programId: saasProgram.id,
        date: analyticsDate,
        totalPartners: 2,
        activePartners: 2,
        totalConversions: 12,
        totalRevenue: 1788,
        totalCommission: 357.6,
        avgConversionValue: 149,
      },
      {
        programId: ecommerceProgram.id,
        date: analyticsDate,
        totalPartners: 1,
        activePartners: 1,
        totalConversions: 25,
        totalRevenue: 28750,
        totalCommission: 2875,
        avgConversionValue: 1150,
      },
    ],
  });

  console.log('✅ Created program analytics snapshots\n');

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('📊 COMPREHENSIVE SEED SUMMARY:\n');
  console.log('  Campaigns: 2');
  console.log('  Partner Tiers: 4 (Bronze, Silver, Gold, Platinum)');
  console.log('  Programs: 4');
  console.log('  Partners: 5 (across different tiers)');
  console.log('  Referral Links: 5');
  console.log('  Conversions: 45+ (with full attribution data)');
  console.log('  Payouts: 3 (PAID, PROCESSING, PENDING)');
  console.log('  API Keys: 2');
  console.log('  Webhooks: 2 (with delivery logs)');
  console.log('  Activity Logs: 3+');
  console.log('  Notes: 2');
  console.log('  Analytics Snapshots: 2\n');

  console.log('🔗 DEMO REFERRAL CODES:\n');
  console.log('  JOHN2024 - Gold tier, SaaS program, 20% commission');
  console.log('  SARAH2024 - Silver tier, SaaS program, 20% commission');
  console.log('  TECHBLOG - Platinum tier, E-commerce, tiered commission');
  console.log('  ECOLIFE2024 - Gold tier, Sustainability, $75/conversion');
  console.log('  RISING - Bronze tier, Influencer program (pending)\n');

  console.log('💡 KEY FEATURES DEMONSTRATED:\n');
  console.log('  ✓ Multi-campaign organization');
  console.log('  ✓ Tiered partner system with progressive benefits');
  console.log('  ✓ Detailed conversion attribution (UTM params, sources)');
  console.log('  ✓ Webhook integration with retry logic');
  console.log('  ✓ Partner API access with scoped permissions');
  console.log('  ✓ Activity audit trail');
  console.log('  ✓ Analytics aggregation');
  console.log('  ✓ Internal notes system\n');

  console.log('✨ Phase 3 database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
