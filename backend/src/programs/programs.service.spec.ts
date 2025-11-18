import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        {
          provide: PrismaService,
          useValue: {
            program: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a program successfully', async () => {
      const createDto = {
        name: 'Test Program',
        type: 'REFERRAL' as const,
        configJson: { percentage: 20 },
      };

      const mockProgram = {
        id: 'program-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.program, 'create').mockResolvedValue(mockProgram);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProgram);
      expect(prismaService.program.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all programs with counts', async () => {
      const mockPrograms = [
        {
          id: 'program-1',
          name: 'Program 1',
          type: 'REFERRAL',
          configJson: { percentage: 20 },
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            partners: 5,
            conversionEvents: 20,
          },
        },
      ];

      vi.spyOn(prismaService.program, 'findMany').mockResolvedValue(
        mockPrograms as any,
      );

      const result = await service.findAll();

      expect(result).toEqual(mockPrograms);
      expect(prismaService.program.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return a program when found', async () => {
      const programId = 'program-123';
      const mockProgram = {
        id: programId,
        name: 'Test Program',
        type: 'REFERRAL',
        configJson: { percentage: 20 },
        createdAt: new Date(),
        updatedAt: new Date(),
        partners: [],
        _count: {
          conversionEvents: 0,
        },
      };

      vi.spyOn(prismaService.program, 'findUnique').mockResolvedValue(
        mockProgram as any,
      );

      const result = await service.findOne(programId);

      expect(result).toEqual(mockProgram);
    });

    it('should throw NotFoundException when program not found', async () => {
      const programId = 'non-existent';

      vi.spyOn(prismaService.program, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(programId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(programId)).rejects.toThrow(
        `Program with ID ${programId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a program successfully', async () => {
      const programId = 'program-123';
      const updateDto = {
        name: 'Updated Program',
        configJson: { percentage: 25 },
      };

      const existingProgram = {
        id: programId,
        name: 'Old Program',
        type: 'REFERRAL',
        configJson: { percentage: 20 },
        createdAt: new Date(),
        updatedAt: new Date(),
        partners: [],
        _count: {
          conversionEvents: 0,
        },
      };

      const updatedProgram = {
        ...existingProgram,
        ...updateDto,
      };

      vi.spyOn(prismaService.program, 'findUnique').mockResolvedValue(
        existingProgram as any,
      );
      vi.spyOn(prismaService.program, 'update').mockResolvedValue(
        updatedProgram as any,
      );

      const result = await service.update(programId, updateDto);

      expect(result.name).toBe('Updated Program');
      expect(result.configJson).toEqual({ percentage: 25 });
    });
  });

  describe('remove', () => {
    it('should delete a program successfully', async () => {
      const programId = 'program-123';
      const mockProgram = {
        id: programId,
        name: 'Test Program',
        type: 'REFERRAL',
        configJson: { percentage: 20 },
        createdAt: new Date(),
        updatedAt: new Date(),
        partners: [],
        _count: {
          conversionEvents: 0,
        },
      };

      vi.spyOn(prismaService.program, 'findUnique').mockResolvedValue(
        mockProgram as any,
      );
      vi.spyOn(prismaService.program, 'delete').mockResolvedValue(
        mockProgram as any,
      );

      const result = await service.remove(programId);

      expect(result).toEqual(mockProgram);
      expect(prismaService.program.delete).toHaveBeenCalledWith({
        where: { id: programId },
      });
    });
  });
});
