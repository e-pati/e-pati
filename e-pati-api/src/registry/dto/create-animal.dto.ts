import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnimalClass, AnimalIdentifierType, AnimalSex } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnimalIdentifierDto {
  @ApiProperty({ enum: AnimalIdentifierType })
  @IsEnum(AnimalIdentifierType)
  type!: AnimalIdentifierType;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  value!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  issuedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issuedAt?: string;
}

export class CreateAnimalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  hkn?: string;

  @ApiProperty({ enum: AnimalClass })
  @IsEnum(AnimalClass)
  class!: AnimalClass;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  species!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  breed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: AnimalSex })
  @IsOptional()
  @IsEnum(AnimalSex)
  sex?: AnimalSex;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  birthPlace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  petId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPremiseId?: string;

  @ApiPropertyOptional({ type: [CreateAnimalIdentifierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnimalIdentifierDto)
  identifiers?: CreateAnimalIdentifierDto[];
}
