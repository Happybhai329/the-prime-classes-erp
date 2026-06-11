import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Permission, UserRole } from '@prime/shared-types';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, QueryDocumentDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Permissions(Permission.DOCUMENT_UPLOAD)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new document' })
  async uploadDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.uploadDocument(tenantId, userId, dto, file);
  }

  @Get()
  @Permissions(Permission.DOCUMENT_VIEW_ALL)
  @ApiOperation({ summary: 'List all documents (admin)' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryDocumentDto,
  ) {
    return this.documentsService.findAll(tenantId, query);
  }

  @Get('my')
  @Permissions(Permission.DOCUMENT_VIEW_OWN)
  @ApiOperation({ summary: 'Get documents for current user (student/parent)' })
  async getMyDocuments(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('role') role: UserRole,
    @CurrentUser('parent') parentData: any, // assuming parent profile is loaded in token/request
    @CurrentUser('student') studentData: any,
    @Query() query: QueryDocumentDto,
  ) {
    let studentIds: string[] = [];
    if (role === UserRole.PARENT && parentData) {
      // In a real implementation, you'd fetch the parent's linked students
      // For now, assuming it's available or we pass it
      // studentIds = parentData.children.map(c => c.id);
    } else if (role === UserRole.STUDENT && studentData) {
      studentIds = [studentData.id];
    }
    
    return this.documentsService.findAll(tenantId, query, studentIds);
  }

  @Get(':id/download')
  @Permissions(Permission.DOCUMENT_VIEW_OWN)
  @ApiOperation({ summary: 'Get a presigned download URL for a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getDownloadUrl(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.getDownloadUrl(tenantId, id);
  }

  @Delete(':id')
  @Permissions(Permission.DOCUMENT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.remove(tenantId, id);
  }
}
