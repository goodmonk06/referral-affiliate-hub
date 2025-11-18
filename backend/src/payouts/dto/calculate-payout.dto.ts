import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsUUID, IsNotEmpty } from 'class-validator';

export class CalculatePayoutDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  periodEnd: string;
}
