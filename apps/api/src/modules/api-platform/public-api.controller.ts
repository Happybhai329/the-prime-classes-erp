import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiKeyGuard } from './api-key.guard';
import { ApiScopes } from './api-scopes.decorator';
import { ApiUsageInterceptor } from './api-usage.interceptor';
import { PublicApiService } from './public-api.service';

@ApiTags('Public API v1')
@ApiHeader({ name: 'X-API-Key', required: true })
@UseGuards(ApiKeyGuard)
@UseInterceptors(ApiUsageInterceptor)
@Controller('api/public/v1')
export class PublicApiController {
  constructor(private readonly service: PublicApiService) {}

  @Get('branches')
  @ApiScopes('branches:read')
  @ApiOperation({ summary: 'List branches visible to the API key' })
  branches(@Req() request: Request & any) {
    return this.service.listBranches(request);
  }

  @Get('students')
  @ApiScopes('students:read')
  students(
    @Req() request: Request & any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.listStudents(request, Number(page), Number(limit));
  }

  @Get('leads')
  @ApiScopes('leads:read')
  leads(
    @Req() request: Request & any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.listLeads(request, Number(page), Number(limit));
  }

  @Get('admissions')
  @ApiScopes('admissions:read')
  admissions(
    @Req() request: Request & any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.listAdmissions(request, Number(page), Number(limit));
  }

  @Get('payments')
  @ApiScopes('payments:read')
  payments(
    @Req() request: Request & any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.listPayments(request, Number(page), Number(limit));
  }

  @Get('analytics/summary')
  @ApiScopes('analytics:read')
  analytics(@Req() request: Request & any) {
    return this.service.analyticsSummary(request);
  }

  @Get('resources')
  @ApiScopes('resources:read')
  resources(@Req() request: Request & any) {
    return this.service.listResources(request);
  }

  @Get('support-tickets')
  @ApiScopes('support:read')
  supportTickets(
    @Req() request: Request & any,
    @Query('limit') limit = 50,
  ) {
    return this.service.listSupportTickets(request, Number(limit));
  }
}
