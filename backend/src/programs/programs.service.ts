import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto, UpdateProgramDto } from './dto';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async create(createProgramDto: CreateProgramDto) {
    return this.prisma.program.create({
      data: createProgramDto,
    });
  }

  async findAll() {
    return this.prisma.program.findMany({
      include: {
        _count: {
          select: {
            partners: true,
            conversionEvents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        partners: true,
        _count: {
          select: {
            conversionEvents: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async update(id: string, updateProgramDto: UpdateProgramDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.program.update({
      where: { id },
      data: updateProgramDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.program.delete({
      where: { id },
    });
  }
}
