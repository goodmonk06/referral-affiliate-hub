import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { EventBus } from '../lib/events';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, EventBus],
  exports: [CampaignsService],
})
export class CampaignsModule {}
