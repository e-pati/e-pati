import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdoptionListingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdoptionListingDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  healthSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  suitabilityNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @ApiPropertyOptional({ enum: AdoptionListingStatus })
  @IsOptional()
  @IsEnum(AdoptionListingStatus)
  status?: AdoptionListingStatus;
}
