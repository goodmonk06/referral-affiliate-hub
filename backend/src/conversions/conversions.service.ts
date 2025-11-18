import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversionDto } from './dto';

@Injectable()
export class ConversionsService {
  constructor(private prisma: PrismaService) {}

  async create(createConversionDto: CreateConversionDto) {
    return this.prisma.conversionEvent.create({
      data: createConversionDto,
      include: {
        program: true,
        partner: true,
      },
    });
  }

  async findAll(partnerId?: string, programId?: string) {
    return this.prisma.conversionEvent.findMany({
      where: {
        ...(partnerId && { partnerId }),
        ...(programId && { programId }),
      },
      include: {
        program: true,
        partner: true,
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const conversion = await this.prisma.conversionEvent.findUnique({
      where: { id },
      include: {
        program: true,
        partner: true,
      },
    });

    if (!conversion) {
      throw new NotFoundException(`Conversion event with ID ${id} not found`);
    }

    return conversion;
  }

  async getStatsByPartner(partnerId: string) {
    const conversions = await this.prisma.conversionEvent.findMany({
      where: { partnerId },
    });

    const totalRevenue = conversions.reduce((sum, conv) => sum + conv.amount, 0);
    const totalCount = conversions.length;

    return {
      partnerId,
      totalConversions: totalCount,
      totalRevenue,
      currency: conversions[0]?.currency || 'USD',
    };
  }
}
