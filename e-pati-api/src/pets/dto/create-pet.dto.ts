import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetSex } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsPhoneNumber,
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

  @ApiPropertyOptional({
    description:
      'Existing owner id. Clinic staff can use this to link the pet to an owner.',
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ example: 'Burak Yilmaz' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  ownerFullName?: string;

  @ApiPropertyOptional({ example: 'sahip@example.com' })
  @IsOptional()
  @IsEmail()
  ownerEmail?: string;

  @ApiPropertyOptional({ example: '+905551112233' })
  @IsOptional()
  @IsPhoneNumber()
  ownerPhone?: string;
}
