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
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { Permission, UserRole } from '@prime/shared-types';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto, QueryMaterialDto, CreateCategoryDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Study Materials & Digital Library')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('materials')
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly prisma: PrismaService,
  ) {}

  // ──────────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────────

  @Post('categories')
  @Permissions(Permission.MATERIAL_UPLOAD)
  @ApiOperation({ summary: 'Create a new material category' })
  async createCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.materialsService.createCategory(tenantId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all material categories' })
  async findCategories(@CurrentUser('tenantId') tenantId: string) {
    return this.materialsService.findCategories(tenantId);
  }

  // ──────────────────────────────────────────────────
  // STUDY MATERIALS
  // ──────────────────────────────────────────────────

  @Post()
  @Permissions(Permission.MATERIAL_UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new study material file (PDF, notes, assignments)' })
  async uploadMaterial(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.materialsService.uploadMaterial(tenantId, userId, dto, file);
  }

  @Patch(':id')
  @Permissions(Permission.MATERIAL_UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update material metadata or upload a new file version' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateMaterial(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaterialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.materialsService.updateMaterial(tenantId, id, userId, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Find study materials with pagination, search, and role boundaries' })
  async findMaterials(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: QueryMaterialDto,
  ) {
    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });
      if (!student) throw new BadRequestException('Student profile not found');
      studentId = student.id;
    } else if (role === UserRole.PARENT) {
      // Find the first student linked to this parent for context
      const parent = await this.prisma.parent.findFirst({
        where: { userId, tenantId },
        include: { studentMappings: true },
      });
      studentId = parent?.studentMappings[0]?.studentId;
    }

    return this.materialsService.findMaterials(tenantId, query, {
      role,
      studentId,
      userId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a study material' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialsService.findOne(tenantId, id);
  }

  @Get(':id/download')
  @Permissions(Permission.MATERIAL_DOWNLOAD)
  @ApiOperation({ summary: 'Get presigned download URL and log the download' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getDownloadUrl(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    return this.materialsService.getPresignedUrl(
      tenantId,
      id,
      userId,
      'DOWNLOAD',
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get(':id/preview')
  @Permissions(Permission.MATERIAL_DOWNLOAD)
  @ApiOperation({ summary: 'Get presigned preview URL and log the preview' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getPreviewUrl(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    return this.materialsService.getPresignedUrl(
      tenantId,
      id,
      userId,
      'PREVIEW',
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle material favorite status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async toggleFavorite(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can favorite materials');
    }
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    return this.materialsService.toggleFavorite(tenantId, id, student.id);
  }

  @Get(':id/logs')
  @Permissions(Permission.MATERIAL_UPLOAD)
  @ApiOperation({ summary: 'Get material access and download audit logs' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getAccessLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialsService.getAccessLogs(tenantId, id);
  }

  @Delete(':id')
  @Permissions(Permission.MATERIAL_DELETE)
  @ApiOperation({ summary: 'Soft delete a study material' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialsService.remove(tenantId, id);
  }
}
