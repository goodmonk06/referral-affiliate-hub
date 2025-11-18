import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto, UpdatePayoutDto, CalculatePayoutDto } from './dto';

@ApiTags('Payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payout manually' })
  @ApiResponse({ status: 201, description: 'Payout created successfully' })
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutsService.create(createPayoutDto);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate and create payout for a partner' })
  @ApiResponse({ status: 201, description: 'Payout calculated and created successfully' })
  @ApiResponse({ status: 400, description: 'No conversions found for this period' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  calculatePayout(@Body() calculatePayoutDto: CalculatePayoutDto) {
    return this.payoutsService.calculatePayout(
      calculatePayoutDto.partnerId,
      new Date(calculatePayoutDto.periodStart),
      new Date(calculatePayoutDto.periodEnd),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all payouts' })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Filter by partner ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'List of all payouts' })
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('status') status?: string,
  ) {
    return this.payoutsService.findAll(partnerId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payout by ID' })
  @ApiResponse({ status: 200, description: 'Payout details' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  findOne(@Param('id') id: string) {
    return this.payoutsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payout (e.g., change status)' })
  @ApiResponse({ status: 200, description: 'Payout updated successfully' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  update(@Param('id') id: string, @Body() updatePayoutDto: UpdatePayoutDto) {
    return this.payoutsService.update(id, updatePayoutDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payout' })
  @ApiResponse({ status: 200, description: 'Payout deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  remove(@Param('id') id: string) {
    return this.payoutsService.remove(id);
  }
}
