import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({ status: 201, description: 'Partner created successfully' })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiResponse({ status: 200, description: 'List of all partners' })
  findAll(@Query('programId') programId?: string) {
    return this.partnersService.findAll(programId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a partner by ID' })
  @ApiResponse({ status: 200, description: 'Partner details' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a partner' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a partner' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
