import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'NewP@ssw0rd' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
