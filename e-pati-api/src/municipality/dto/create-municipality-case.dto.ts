import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMunicipalityCaseDto {
  @ApiProperty()
  @IsString()
  animalId!: string;

  @ApiProperty()
  @IsString()
  shelterPremiseId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  municipalityName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  caseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  intakeSource?: string;

  @ApiProperty()
  @IsDateString()
  intakeAt!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  foundProvince!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  foundDistrict!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  foundNeighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  publicLocationNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
