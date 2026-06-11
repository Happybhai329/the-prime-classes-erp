import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prime/shared-types';

export class UploadDocumentDto {
  @ApiProperty({ example: 'Term 1 Report Card' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.REPORT_CARD })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiPropertyOptional({ description: 'Optional ID of student this document belongs to' })
  @IsOptional()
  @IsUUID()
  studentId?: string;
}
