import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnimalClass, AnimalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListAnimalsQueryDto {
  @ApiPropertyOptional({ enum: AnimalClass })
  @IsOptional()
  @IsEnum(AnimalClass)
  class?: AnimalClass;

  @ApiPropertyOptional({ enum: AnimalStatus })
  @IsOptional()
  @IsEnum(AnimalStatus)
  status?: AnimalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  premiseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  identifier?: string;
}
