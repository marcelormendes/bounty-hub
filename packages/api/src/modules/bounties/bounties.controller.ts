import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BountiesService } from './bounties.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { BountyStatus, BountyType } from './entities/bounty.entity';

@ApiTags('bounties')
@Controller('bounties')
export class BountiesController {
  constructor(private readonly bountiesService: BountiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new bounty' })
  create(@Body() createBountyDto: CreateBountyDto, @Req() req) {
    return this.bountiesService.create(createBountyDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bounties with optional filtering' })
  @ApiQuery({ name: 'status', enum: BountyStatus, required: false })
  @ApiQuery({ name: 'type', enum: BountyType, required: false })
  findAll(
    @Query('status') status?: BountyStatus,
    @Query('type') type?: BountyType,
  ) {
    return this.bountiesService.findAll({ status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bounty by id' })
  findOne(@Param('id') id: string) {
    return this.bountiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a bounty' })
  update(
    @Param('id') id: string,
    @Body() updateBountyDto: UpdateBountyDto,
    @Req() req,
  ) {
    return this.bountiesService.update(id, updateBountyDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a bounty' })
  remove(@Param('id') id: string, @Req() req) {
    return this.bountiesService.remove(id, req.user);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a bounty to yourself' })
  assignBounty(@Param('id') id: string, @Req() req) {
    return this.bountiesService.assignBounty(id, req.user);
  }

  @Post(':id/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release a bounty assignment' })
  releaseBounty(@Param('id') id: string, @Req() req) {
    return this.bountiesService.releaseBounty(id, req.user);
  }
}