import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SterilizationStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSterilizationRecordDto {
  @ApiProperty()
  @IsDateString()
  performedAt!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  veterinarianName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  clinicName?: string;

  @ApiPropertyOptional({ enum: SterilizationStatus })
  @IsOptional()
  @IsEnum(SterilizationStatus)
  status?: SterilizationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  anesthesiaNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  surgeryNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  complicationNotes?: string;
}
