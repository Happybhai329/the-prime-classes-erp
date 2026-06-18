import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { RegisterTenantRequest, VerifyEmailRequest, ProvisionTenantRequest } from '@prime/shared-types';
import { Public } from '../../common/decorators';

@ApiTags('Self-Service Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Step 1: Register a new institute tenant & request verification email' })
  async register(@Body() dto: RegisterTenantRequest) {
    const result = await this.onboardingService.register(dto);
    return {
      success: true,
      data: result,
      message: 'Onboarding session initialized. Please check your email for the OTP.',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2: Verify owner email address using the sent OTP code' })
  async verifyEmail(@Body() dto: VerifyEmailRequest) {
    const result = await this.onboardingService.verifyEmail(dto);
    return {
      success: true,
      data: result,
      message: 'Email verified successfully. You can now configure your workspace.',
    };
  }

  @Public()
  @Post('provision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 3: Provision admin account, select subscription plan, configure custom domains, and launch ERP' })
  async provision(@Body() dto: ProvisionTenantRequest) {
    const result = await this.onboardingService.provision(dto);
    return {
      success: true,
      data: result,
      message: 'Institute workspace provisioned successfully. Redirecting to ERP launchpad.',
    };
  }
}
