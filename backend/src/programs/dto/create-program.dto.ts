import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsObject } from 'class-validator';

export enum ProgramType {
  REFERRAL = 'REFERRAL',
  AFFILIATE = 'AFFILIATE',
}

export class CreateProgramDto {
  @ApiProperty({ example: 'Pro Subscription Referral' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ProgramType, example: ProgramType.REFERRAL })
  @IsEnum(ProgramType)
  type: ProgramType;

  @ApiProperty({
    example: { percentage: 20, fixedBounty: 50 },
    description: 'Configuration for payout rules (percentage, fixedBounty, or tiers)',
  })
  @IsObject()
  configJson: {
    percentage?: number;
    fixedBounty?: number;
    tiers?: Array<{ minAmount: number; percentage?: number; fixedBounty?: number }>;
  };
}
