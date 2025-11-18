import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'partner@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    example: { type: 'stripe', accountId: 'acct_123456' },
    description: 'Payout method configuration',
  })
  @IsObject()
  payoutMethodJson: {
    type: 'stripe' | 'paypal' | 'bank';
    accountId: string;
    [key: string]: any;
  };
}
