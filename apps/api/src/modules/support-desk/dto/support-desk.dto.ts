import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { SupportPriority } from '@prime/shared-types';

export class CreateSlaPolicyDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsEnum(SupportPriority)
  priority!: SupportPriority;

  @IsInt()
  @Min(1)
  firstResponseMinutes!: number;

  @IsInt()
  @Min(1)
  resolutionMinutes!: number;

  @IsOptional()
  @IsObject()
  escalationRules?: Record<string, unknown>;
}

export class CreateKnowledgeBaseArticleDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
