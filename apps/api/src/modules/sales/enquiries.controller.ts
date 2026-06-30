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
  Res,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Permission } from '@prime/shared-types';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto, QueryEnquiryDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Enquiries')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  @Permissions(Permission.ENQUIRY_READ)
  @ApiOperation({ summary: 'List enquiries with filters, pagination, and search' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryEnquiryDto,
  ) {
    return this.enquiriesService.findAll(tenantId, query);
  }

  @Get('export/csv')
  @Permissions(Permission.ENQUIRY_EXPORT)
  @ApiOperation({ summary: 'Export enquiries as CSV' })
  async exportCsv(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryEnquiryDto,
    @Res() res: Response,
  ) {
    const csv = await this.enquiriesService.exportCsv(tenantId, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enquiries-export.csv');
    res.send(csv);
  }

  @Get(':id')
  @Permissions(Permission.ENQUIRY_READ)
  @ApiOperation({ summary: 'Get detailed enquiry record' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enquiriesService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.ENQUIRY_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually capture an enquiry' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEnquiryDto,
  ) {
    return this.enquiriesService.create(tenantId, dto, userId);
  }

  @Patch(':id')
  @Permissions(Permission.ENQUIRY_WRITE)
  @ApiOperation({ summary: 'Update enquiry details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnquiryDto,
  ) {
    return this.enquiriesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ENQUIRY_DELETE)
  @ApiOperation({ summary: 'Delete an enquiry' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enquiriesService.remove(tenantId, id);
  }

  @Post('bulk-delete')
  @Permissions(Permission.ENQUIRY_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete enquiries' })
  async bulkDelete(
    @CurrentUser('tenantId') tenantId: string,
    @Body('ids') ids: string[],
  ) {
    return this.enquiriesService.bulkDelete(tenantId, ids);
  }

  @Post('import')
  @Permissions(Permission.ENQUIRY_IMPORT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import enquiries from CSV file' })
  async importCsv(
    @CurrentUser('tenantId') tenantId: string,
    @UploadedFile() file: any,
    @CurrentUser('id') userId: string,
  ) {
    const csvContent = file.buffer.toString('utf-8');
    return this.enquiriesService.importCsv(tenantId, csvContent, userId);
  }
}
