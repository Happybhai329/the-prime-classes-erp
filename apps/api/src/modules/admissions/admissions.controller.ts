import {
  Controller,
  Get,
  Post,
  Patch,
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
import { Permission, ApplicationStatus, DocumentVerificationStatus, PaymentStatus } from '@prime/shared-types';
import { AdmissionsService } from './admissions.service';
import { CurrentUser, Permissions, Public } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Online Admissions Portal')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  // --- PUBLIC PORTAL ENDPOINTS ---

  @Post('apply')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit online student admission application' })
  async submitApplication(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: any,
  ) {
    return this.admissionsService.submitApplication(tenantId, body);
  }

  @Get('track')
  @Public()
  @ApiOperation({ summary: 'Track application status with app number and phone' })
  async trackApplication(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('applicationNumber') appNumber: string,
    @Query('phone') phone: string,
  ) {
    return this.admissionsService.trackApplication(tenantId, appNumber, phone);
  }

  @Post(':id/upload-document')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload document (photo, aadhaar, birth cert, marksheet, transfer cert)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { documentType: string; documentUrl: string },
  ) {
    return this.admissionsService.uploadDocument(id, body.documentType, body.documentUrl);
  }

  // --- ADMIN WORKFLOW ENDPOINTS ---

  @Get('applications')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ADMISSION_APP_VIEW)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List admission applications with filters' })
  async findAllApplications(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ApplicationStatus;
      classApplyingFor?: string;
    },
  ) {
    return this.admissionsService.findAllApplications(tenantId, query);
  }

  @Get('applications/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ADMISSION_APP_VIEW)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application details and verification history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findApplicationById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.admissionsService.findApplicationById(tenantId, id);
  }

  @Patch('applications/:id/status')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ADMISSION_APP_EDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application workflow stage (verify, approve, reject, enroll)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.admissionsService.updateApplicationStatus(tenantId, id, status);
  }

  @Patch('applications/:id/payment')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ADMISSION_APP_EDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log payment details for registration fee' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updatePayment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: PaymentStatus; amount: number; details?: any },
  ) {
    return this.admissionsService.updatePaymentStatus(tenantId, id, body);
  }

  @Post('documents/:documentId/verify')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ADMISSION_APP_VERIFY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a document upload' })
  @ApiParam({ name: 'documentId', type: 'string', format: 'uuid' })
  async verifyDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() body: { status: DocumentVerificationStatus; rejectionReason?: string },
  ) {
    return this.admissionsService.verifyDocument(tenantId, documentId, body.status, body.rejectionReason, userId);
  }
}
