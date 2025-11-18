import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBus } from '../lib/events';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        startDate: createCampaignDto.startDate
          ? new Date(createCampaignDto.startDate)
          : null,
        endDate: createCampaignDto.endDate
          ? new Date(createCampaignDto.endDate)
          : null,
      },
    });

    // Publish event
    await this.eventBus.publish({
      type: 'campaign.created',
      timestamp: new Date(),
      aggregateId: campaign.id,
      payload: {
        campaignId: campaign.id,
        name: campaign.name,
      },
    });

    return campaign;
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            programs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        programs: {
          include: {
            _count: {
              select: {
                partners: true,
                conversionEvents: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    await this.findOne(id);

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...updateCampaignDto,
        startDate: updateCampaignDto.startDate
          ? new Date(updateCampaignDto.startDate)
          : undefined,
        endDate: updateCampaignDto.endDate
          ? new Date(updateCampaignDto.endDate)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const campaign = await this.findOne(id);

    // Aggregate stats from all programs in the campaign
    const stats = await this.prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT p.id) as total_programs,
        COUNT(DISTINCT pt.id) as total_partners,
        COUNT(DISTINCT ce.id) as total_conversions,
        COALESCE(SUM(ce.amount), 0) as total_revenue
      FROM campaigns c
      LEFT JOIN programs p ON p."campaignId" = c.id
      LEFT JOIN partners pt ON pt."programId" = p.id
      LEFT JOIN conversion_events ce ON ce."programId" = p.id
      WHERE c.id = ${id}
    `;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
      },
      stats: stats[0] || {
        total_programs: 0,
        total_partners: 0,
        total_conversions: 0,
        total_revenue: 0,
      },
    };
  }
}
