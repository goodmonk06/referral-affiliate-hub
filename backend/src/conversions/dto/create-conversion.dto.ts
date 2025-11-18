import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsNotEmpty, IsObject, Min } from 'class-validator';

export class CreateConversionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @ApiPropertyOptional({ example: 'user_12345' })
  @IsString()
  @IsOptional()
  referredUserId?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    example: { subscriptionPlan: 'pro', billingCycle: 'annual' },
  })
  @IsObject()
  @IsOptional()
  metaJson?: Record<string, any>;
}
