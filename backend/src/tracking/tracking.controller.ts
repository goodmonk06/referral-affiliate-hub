import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { RecordConversionDto } from './dto';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('attribution')
  @ApiOperation({
    summary: 'Track attribution by referral code',
    description: 'Use this endpoint when a user visits with ?ref=CODE parameter',
  })
  @ApiQuery({ name: 'ref', description: 'Referral code' })
  @ApiResponse({ status: 200, description: 'Attribution tracked successfully' })
  @ApiResponse({ status: 404, description: 'Referral code not found' })
  async trackAttribution(@Query('ref') ref: string) {
    return this.trackingService.trackByCode(ref);
  }

  @Get('r/:slug')
  @ApiOperation({
    summary: 'Track attribution by URL slug',
    description: 'Use this endpoint when a user visits /r/:slug',
  })
  @ApiResponse({ status: 200, description: 'Attribution tracked successfully' })
  @ApiResponse({ status: 404, description: 'Referral slug not found' })
  async trackBySlug(@Param('slug') slug: string) {
    return this.trackingService.trackBySlug(slug);
  }

  @Post('conversion')
  @ApiOperation({
    summary: 'Record a conversion event',
    description: 'Call this endpoint when a referred user completes a purchase or signup',
  })
  @ApiResponse({ status: 201, description: 'Conversion recorded successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async recordConversion(@Body() recordConversionDto: RecordConversionDto) {
    return this.trackingService.recordConversion(
      recordConversionDto.partnerId,
      recordConversionDto.amount,
      recordConversionDto.referredUserId,
      recordConversionDto.metaJson,
    );
  }
}
