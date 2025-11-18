import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { ReferralLinksModule } from '../referral-links/referral-links.module';

@Module({
  imports: [ReferralLinksModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
