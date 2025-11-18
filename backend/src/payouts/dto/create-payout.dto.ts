import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsEnum, IsUUID, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export class CreatePayoutDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  periodStart: Date;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  periodEnd: Date;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: PayoutStatus, default: PayoutStatus.PENDING })
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;
}
