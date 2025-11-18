import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConversionsService } from './conversions.service';
import { CreateConversionDto } from './dto';

@ApiTags('Conversions')
@Controller('conversions')
export class ConversionsController {
  constructor(private readonly conversionsService: ConversionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new conversion event' })
  @ApiResponse({ status: 201, description: 'Conversion recorded successfully' })
  create(@Body() createConversionDto: CreateConversionDto) {
    return this.conversionsService.create(createConversionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversion events' })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Filter by partner ID' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiResponse({ status: 200, description: 'List of all conversion events' })
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('programId') programId?: string,
  ) {
    return this.conversionsService.findAll(partnerId, programId);
  }

  @Get('stats/:partnerId')
  @ApiOperation({ summary: 'Get conversion statistics for a partner' })
  @ApiResponse({ status: 200, description: 'Partner conversion statistics' })
  getStatsByPartner(@Param('partnerId') partnerId: string) {
    return this.conversionsService.getStatsByPartner(partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversion event by ID' })
  @ApiResponse({ status: 200, description: 'Conversion event details' })
  @ApiResponse({ status: 404, description: 'Conversion event not found' })
  findOne(@Param('id') id: string) {
    return this.conversionsService.findOne(id);
  }
}
