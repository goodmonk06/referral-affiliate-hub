import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Referral & Affiliate Hub API is running!';
  }
}
