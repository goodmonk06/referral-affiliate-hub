import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralLinkDto } from './dto';

@Injectable()
export class ReferralLinksService {
  constructor(private prisma: PrismaService) {}

  async create(createReferralLinkDto: CreateReferralLinkDto) {
    // Check for duplicate code or slug
    const existing = await this.prisma.referralLink.findFirst({
      where: {
        OR: [
          { code: createReferralLinkDto.code },
          { urlSlug: createReferralLinkDto.urlSlug },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Referral code or URL slug already exists');
    }

    return this.prisma.referralLink.create({
      data: createReferralLinkDto,
      include: {
        partner: true,
      },
    });
  }

  async findAll(partnerId?: string) {
    return this.prisma.referralLink.findMany({
      where: partnerId ? { partnerId } : undefined,
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
    const link = await this.prisma.referralLink.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException(`Referral link with ID ${id} not found`);
    }

    return link;
  }

  async findByCode(code: string) {
    return this.prisma.referralLink.findUnique({
      where: { code },
      include: {
        partner: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  async findBySlug(urlSlug: string) {
    return this.prisma.referralLink.findUnique({
      where: { urlSlug },
      include: {
        partner: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.referralLink.delete({
      where: { id },
    });
  }
}
