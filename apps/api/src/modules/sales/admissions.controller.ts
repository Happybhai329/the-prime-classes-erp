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
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto, UpdateAdmissionDto, QueryAdmissionDto, EnrollStudentDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Admissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get()
  @Permissions(Permission.ADMISSION_READ)
  @ApiOperation({ summary: 'List admissions with pagination, search, and filters' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryAdmissionDto,
  ) {
    return this.admissionsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.ADMISSION_READ)
  @ApiOperation({ summary: 'Get admission details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.admissionsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.ADMISSION_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually register an admission' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdmissionDto,
  ) {
    return this.admissionsService.create(tenantId, dto, userId);
  }

  @Post('convert/:enquiryId')
  @Permissions(Permission.ADMISSION_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Convert enquiry to admission' })
  @ApiParam({ name: 'enquiryId', type: 'string', format: 'uuid' })
  async convertFromEnquiry(
    @CurrentUser('tenantId') tenantId: string,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.admissionsService.convertFromEnquiry(tenantId, enquiryId, userId);
  }

  @Patch(':id')
  @Permissions(Permission.ADMISSION_WRITE)
  @ApiOperation({ summary: 'Update admission details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionDto,
  ) {
    return this.admissionsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ADMISSION_DELETE)
  @ApiOperation({ summary: 'Delete admission record' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.admissionsService.remove(tenantId, id);
  }

  @Post(':id/enroll')
  @Permissions(Permission.ADMISSION_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll converted student into Core Academic ERP database' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async enrollIntoAcademic(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrollStudentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.admissionsService.enrollIntoAcademic(tenantId, id, dto, userId);
  }
}
