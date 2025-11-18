import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class CreateReferralLinkDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ example: 'ACME2024' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Code must contain only letters, numbers, hyphens, and underscores',
  })
  code: string;

  @ApiProperty({ example: 'acme-corp' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'URL slug must contain only lowercase letters, numbers, and hyphens',
  })
  urlSlug: string;
}
