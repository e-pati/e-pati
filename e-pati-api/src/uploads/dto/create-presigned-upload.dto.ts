import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const UPLOAD_FOLDERS = ['lab-results', 'prescriptions', 'pets'] as const;

export class CreatePresignedUploadDto {
  @ApiProperty({ example: 'result.pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  mimeType: string;

  @ApiPropertyOptional({ enum: UPLOAD_FOLDERS, default: 'lab-results' })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: (typeof UPLOAD_FOLDERS)[number];
}
