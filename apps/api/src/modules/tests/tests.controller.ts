import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { TestsService } from './tests.service';
import { CreateTestDto, UpdateTestDto, EnterMarksDto, QueryTestDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @Permissions(Permission.TEST_VIEW_ALL)
  @ApiOperation({ summary: 'List tests with pagination and filters' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryTestDto,
  ) {
    return this.testsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.TEST_VIEW_ALL)
  @ApiOperation({ summary: 'Get test detail with marks and rankings' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.TEST_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new test' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTestDto,
  ) {
    return this.testsService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.TEST_EDIT)
  @ApiOperation({ summary: 'Update test details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.testsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.TEST_DELETE)
  @ApiOperation({ summary: 'Delete test (only DRAFT/SCHEDULED)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.remove(tenantId, id);
  }

  @Post(':id/marks')
  @Permissions(Permission.TEST_MARKS_ENTRY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enter or update marks for students' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async enterMarks(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnterMarksDto,
  ) {
    return this.testsService.enterMarks(tenantId, id, userId, dto);
  }

  @Post(':id/compute-rankings')
  @Permissions(Permission.TEST_PUBLISH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compute rankings, percentile, and grades' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async computeRankings(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.computeRankings(tenantId, id);
  }

  @Patch(':id/publish')
  @Permissions(Permission.TEST_PUBLISH)
  @ApiOperation({ summary: 'Publish test results' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async publish(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.publish(tenantId, id);
  }

  @Get(':id/merit-list')
  @Permissions(Permission.TEST_VIEW_ALL)
  @ApiOperation({ summary: 'Get merit/rank list for a test' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getMeritList(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.getMeritList(tenantId, id);
  }

  @Get(':id/subject-analysis')
  @Permissions(Permission.TEST_VIEW_ALL)
  @ApiOperation({ summary: 'Get subject-wise analysis for a test' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getSubjectAnalysis(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testsService.getSubjectAnalysis(tenantId, id);
  }
}
