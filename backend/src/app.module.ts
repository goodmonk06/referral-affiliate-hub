import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ProgramsModule } from './programs/programs.module';
import { PartnersModule } from './partners/partners.module';
import { ReferralLinksModule } from './referral-links/referral-links.module';
import { ConversionsModule } from './conversions/conversions.module';
import { PayoutsModule } from './payouts/payouts.module';
import { TrackingModule } from './tracking/tracking.module';
import { EventBus } from './lib/events';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CampaignsModule,
    ProgramsModule,
    PartnersModule,
    ReferralLinksModule,
    ConversionsModule,
    PayoutsModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventBus],
})
export class AppModule {}
