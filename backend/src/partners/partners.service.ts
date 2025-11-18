import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: createPartnerDto,
      include: {
        program: true,
      },
    });
  }

  async findAll(programId?: string) {
    return this.prisma.partner.findMany({
      where: programId ? { programId } : undefined,
      include: {
        program: true,
        _count: {
          select: {
            referralLinks: true,
            conversionEvents: true,
            payouts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        program: true,
        referralLinks: true,
        payouts: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            conversionEvents: true,
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    await this.findOne(id);

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.partner.delete({
      where: { id },
    });
  }
}
