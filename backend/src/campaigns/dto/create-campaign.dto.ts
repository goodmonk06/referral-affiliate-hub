import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsObject, IsEnum } from 'class-validator';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateCampaignDto {
  @ApiProperty({ example: 'Q4 2024 Marketing Push' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Aggressive affiliate marketing for holiday season' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: CampaignStatus, default: CampaignStatus.DRAFT })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiPropertyOptional({ example: '2024-10-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: { budget: 50000, targetRevenue: 200000 } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
