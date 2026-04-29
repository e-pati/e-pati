import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateLabResultDto {
  @ApiProperty()
  @IsString()
  petId: string;

  @ApiProperty({ example: 'Blood panel' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'https://cdn.example.com/lab-results/result.pdf' })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-04-29T10:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  collectedAt?: string;
}
