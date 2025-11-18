import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsService } from './payouts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        {
          provide: PrismaService,
          useValue: {
            payout: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            partner: {
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('calculatePayoutAmount', () => {
    it('should calculate percentage-based payout correctly', () => {
      const config = { percentage: 20 };
      const conversionAmount = 100;

      // Access private method via type assertion for testing
      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(20); // 100 * 20% = 20
    });

    it('should calculate fixed bounty payout correctly', () => {
      const config = { fixedBounty: 50 };
      const conversionAmount = 100;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(50);
    });

    it('should calculate tier-based payout correctly for low amount', () => {
      const config = {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 500, percentage: 8 },
          { minAmount: 1000, percentage: 10 },
        ],
      };
      const conversionAmount = 250;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(12.5); // 250 * 5% = 12.5
    });

    it('should calculate tier-based payout correctly for mid-tier amount', () => {
      const config = {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 500, percentage: 8 },
          { minAmount: 1000, percentage: 10 },
        ],
      };
      const conversionAmount = 600;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(48); // 600 * 8% = 48
    });

    it('should calculate tier-based payout correctly for high-tier amount', () => {
      const config = {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 500, percentage: 8 },
          { minAmount: 1000, percentage: 10 },
        ],
      };
      const conversionAmount = 1500;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(150); // 1500 * 10% = 150
    });

    it('should use fixed bounty in tier when specified', () => {
      const config = {
        tiers: [
          { minAmount: 0, percentage: 5 },
          { minAmount: 1000, fixedBounty: 100 },
        ],
      };
      const conversionAmount = 1500;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(100); // Fixed bounty of $100
    });

    it('should return 0 for empty config', () => {
      const config = {};
      const conversionAmount = 100;

      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(0);
    });

    it('should handle hybrid config (percentage + fixed)', () => {
      const config = {
        percentage: 10,
        fixedBounty: 25,
      };
      const conversionAmount = 100;

      // Based on current implementation, it takes percentage first
      const result = (service as any).calculatePayoutAmount(
        conversionAmount,
        config,
      );

      expect(result).toBe(10); // 100 * 10% = 10 (percentage takes precedence)
    });
  });

  describe('calculatePayout', () => {
    it('should calculate total payout for multiple conversions', async () => {
      const partnerId = 'partner-123';
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-01-31');

      const mockPartner = {
        id: partnerId,
        programId: 'program-123',
        name: 'Test Partner',
        contactEmail: 'test@example.com',
        payoutMethodJson: { type: 'stripe' },
        createdAt: new Date(),
        updatedAt: new Date(),
        program: {
          id: 'program-123',
          name: 'Test Program',
          type: 'REFERRAL',
          configJson: { percentage: 20 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        conversionEvents: [
          {
            id: 'conv-1',
            programId: 'program-123',
            partnerId,
            referredUserId: 'user-1',
            amount: 100,
            currency: 'USD',
            occurredAt: new Date('2024-01-15'),
            metaJson: {},
          },
          {
            id: 'conv-2',
            programId: 'program-123',
            partnerId,
            referredUserId: 'user-2',
            amount: 200,
            currency: 'USD',
            occurredAt: new Date('2024-01-20'),
            metaJson: {},
          },
        ],
      };

      vi.spyOn(prismaService.partner, 'findUnique').mockResolvedValue(
        mockPartner as any,
      );

      const mockCreatedPayout = {
        id: 'payout-123',
        partnerId,
        periodStart,
        periodEnd,
        amount: 60, // (100 + 200) * 20% = 60
        currency: 'USD',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        partner: mockPartner,
      };

      vi.spyOn(prismaService.payout, 'create').mockResolvedValue(
        mockCreatedPayout as any,
      );

      const result = await service.calculatePayout(
        partnerId,
        periodStart,
        periodEnd,
      );

      expect(result.amount).toBe(60);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('PENDING');
    });

    it('should throw error when no conversions found', async () => {
      const partnerId = 'partner-123';
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-01-31');

      const mockPartner = {
        id: partnerId,
        programId: 'program-123',
        name: 'Test Partner',
        contactEmail: 'test@example.com',
        payoutMethodJson: { type: 'stripe' },
        createdAt: new Date(),
        updatedAt: new Date(),
        program: {
          id: 'program-123',
          name: 'Test Program',
          type: 'REFERRAL',
          configJson: { percentage: 20 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        conversionEvents: [], // No conversions
      };

      vi.spyOn(prismaService.partner, 'findUnique').mockResolvedValue(
        mockPartner as any,
      );

      await expect(
        service.calculatePayout(partnerId, periodStart, periodEnd),
      ).rejects.toThrow('No conversions found for this period');
    });

    it('should throw error when partner not found', async () => {
      const partnerId = 'non-existent';
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-01-31');

      vi.spyOn(prismaService.partner, 'findUnique').mockResolvedValue(null);

      await expect(
        service.calculatePayout(partnerId, periodStart, periodEnd),
      ).rejects.toThrow(`Partner with ID ${partnerId} not found`);
    });
  });
});
