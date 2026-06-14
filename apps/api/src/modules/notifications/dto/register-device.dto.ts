import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MobileDeviceRegisterRequest } from '@prime/shared-types';

export class RegisterDeviceDto implements MobileDeviceRegisterRequest {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsString()
  @IsNotEmpty()
  fcmToken!: string;

  @ApiProperty({ example: 'ANDROID', enum: ['ANDROID', 'IOS'] })
  @IsEnum(['ANDROID', 'IOS'])
  platform!: 'ANDROID' | 'IOS';

  @ApiProperty({ example: 'device-uuid-1234' })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}
