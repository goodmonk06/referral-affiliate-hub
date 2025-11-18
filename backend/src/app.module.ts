import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramsModule } from './programs/programs.module';
import { PartnersModule } from './partners/partners.module';
import { ReferralLinksModule } from './referral-links/referral-links.module';
import { ConversionsModule } from './conversions/conversions.module';
import { PayoutsModule } from './payouts/payouts.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProgramsModule,
    PartnersModule,
    ReferralLinksModule,
    ConversionsModule,
    PayoutsModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
