import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetSex } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'Misket' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Cat' })
  @IsString()
  @MinLength(2)
  species: string;

  @ApiPropertyOptional({ example: 'British Shorthair' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ enum: PetSex, default: PetSex.UNKNOWN })
  @IsOptional()
  @IsEnum(PetSex)
  sex?: PetSex;

  @ApiPropertyOptional({ example: '2021-04-12' })
  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @ApiPropertyOptional({ example: '900182000123456' })
  @IsOptional()
  @IsString()
  microchipNo?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/pets/misket.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
