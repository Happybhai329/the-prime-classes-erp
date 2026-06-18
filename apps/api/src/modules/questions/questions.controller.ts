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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto, BulkImportQuestionsDto, CreateQuestionBankDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Question Bank')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // ──────────────────────────────────────────────────
  // QUESTIONS CRUD
  // ──────────────────────────────────────────────────

  @Post()
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Create a new question in the central repository' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(tenantId, id, dto);
  }

  @Get()
  @Permissions(Permission.QUESTION_BANK_MANAGE, Permission.TEST_CREATE)
  @ApiOperation({ summary: 'List and filter questions' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryQuestionDto,
  ) {
    return this.questionsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.QUESTION_BANK_MANAGE, Permission.TEST_CREATE)
  @ApiOperation({ summary: 'Get details of a single question' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.findOne(tenantId, id);
  }

  @Delete(':id')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Soft delete a question' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.remove(tenantId, id);
  }

  // ──────────────────────────────────────────────────
  // BULK IMPORT
  // ──────────────────────────────────────────────────

  @Post('import')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Bulk import questions (JSON)' })
  async bulkImport(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: BulkImportQuestionsDto,
  ) {
    return this.questionsService.bulkImport(tenantId, dto);
  }

  // ──────────────────────────────────────────────────
  // QUESTION BANKS
  // ──────────────────────────────────────────────────

  @Post('banks')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Create a new Question Bank collection' })
  async createQuestionBank(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateQuestionBankDto,
  ) {
    return this.questionsService.createQuestionBank(tenantId, dto);
  }

  @Get('banks')
  @Permissions(Permission.QUESTION_BANK_MANAGE, Permission.TEST_CREATE)
  @ApiOperation({ summary: 'List all Question Banks' })
  async findQuestionBanks(
    @CurrentUser('tenantId') tenantId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.questionsService.findQuestionBanks(tenantId, subjectId);
  }

  @Get('banks/:id')
  @Permissions(Permission.QUESTION_BANK_MANAGE, Permission.TEST_CREATE)
  @ApiOperation({ summary: 'Get details of a Question Bank' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findQuestionBankDetails(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.findQuestionBankDetails(tenantId, id);
  }

  @Post('banks/:id/questions')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Add questions to a Question Bank' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async addQuestionsToBank(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('questionIds') questionIds: string[],
  ) {
    return this.questionsService.addQuestionsToBank(tenantId, id, questionIds);
  }

  @Delete('banks/:id/questions')
  @Permissions(Permission.QUESTION_BANK_MANAGE)
  @ApiOperation({ summary: 'Remove questions from a Question Bank' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async removeQuestionsFromBank(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('questionIds') questionIds: string[],
  ) {
    return this.questionsService.removeQuestionsFromBank(tenantId, id, questionIds);
  }
}
