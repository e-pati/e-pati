import { ApiPropertyOptional } from '@nestjs/swagger';
import { MunicipalityCaseStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListMunicipalityCasesQueryDto {
  @ApiPropertyOptional({ enum: MunicipalityCaseStatus })
  @IsOptional()
  @IsEnum(MunicipalityCaseStatus)
  status?: MunicipalityCaseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;
}
