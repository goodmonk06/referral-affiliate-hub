import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto, UpdatePayoutDto } from './dto';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate payout amount based on program configuration
   */
  private calculatePayoutAmount(
    conversionAmount: number,
    programConfig: any,
  ): number {
    // If tiers are defined, use tier-based calculation
    if (programConfig.tiers && Array.isArray(programConfig.tiers)) {
      const sortedTiers = programConfig.tiers.sort(
        (a, b) => b.minAmount - a.minAmount,
      );

      for (const tier of sortedTiers) {
        if (conversionAmount >= tier.minAmount) {
          if (tier.percentage) {
            return (conversionAmount * tier.percentage) / 100;
          }
          if (tier.fixedBounty) {
            return tier.fixedBounty;
          }
        }
      }
    }

    // If percentage is defined, use percentage-based calculation
    if (programConfig.percentage) {
      return (conversionAmount * programConfig.percentage) / 100;
    }

    // If fixed bounty is defined, use fixed amount
    if (programConfig.fixedBounty) {
      return programConfig.fixedBounty;
    }

    // Default: no payout
    return 0;
  }

  async create(createPayoutDto: CreatePayoutDto) {
    return this.prisma.payout.create({
      data: createPayoutDto,
      include: {
        partner: true,
      },
    });
  }

  /**
   * Calculate and create payout for a partner for a specific period
   */
  async calculatePayout(
    partnerId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        program: true,
        conversionEvents: {
          where: {
            occurredAt: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${partnerId} not found`);
    }

    if (partner.conversionEvents.length === 0) {
      throw new BadRequestException('No conversions found for this period');
    }

    let totalPayout = 0;
    const currency = partner.conversionEvents[0].currency || 'USD';

    for (const conversion of partner.conversionEvents) {
      const payoutAmount = this.calculatePayoutAmount(
        conversion.amount,
        partner.program.configJson,
      );
      totalPayout += payoutAmount;
    }

    // Create the payout record
    return this.prisma.payout.create({
      data: {
        partnerId,
        periodStart,
        periodEnd,
        amount: totalPayout,
        currency,
        status: 'PENDING',
      },
      include: {
        partner: true,
      },
    });
  }

  async findAll(partnerId?: string, status?: string) {
    return this.prisma.payout.findMany({
      where: {
        ...(partnerId && { partnerId }),
        ...(status && { status: status as any }),
      },
      include: {
        partner: {
          include: {
            program: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }

    return payout;
  }

  async update(id: string, updatePayoutDto: UpdatePayoutDto) {
    await this.findOne(id);

    return this.prisma.payout.update({
      where: { id },
      data: updatePayoutDto,
      include: {
        partner: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.payout.delete({
      where: { id },
    });
  }
}
