import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReferralLinksService } from './referral-links.service';
import { CreateReferralLinkDto } from './dto';

@ApiTags('Referral Links')
@Controller('referral-links')
export class ReferralLinksController {
  constructor(private readonly referralLinksService: ReferralLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new referral link' })
  @ApiResponse({ status: 201, description: 'Referral link created successfully' })
  @ApiResponse({ status: 409, description: 'Code or slug already exists' })
  create(@Body() createReferralLinkDto: CreateReferralLinkDto) {
    return this.referralLinksService.create(createReferralLinkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all referral links' })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Filter by partner ID' })
  @ApiResponse({ status: 200, description: 'List of all referral links' })
  findAll(@Query('partnerId') partnerId?: string) {
    return this.referralLinksService.findAll(partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a referral link by ID' })
  @ApiResponse({ status: 200, description: 'Referral link details' })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  findOne(@Param('id') id: string) {
    return this.referralLinksService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a referral link' })
  @ApiResponse({ status: 200, description: 'Referral link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  remove(@Param('id') id: string) {
    return this.referralLinksService.remove(id);
  }
}
