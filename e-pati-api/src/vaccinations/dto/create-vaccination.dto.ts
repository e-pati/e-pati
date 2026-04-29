import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVaccinationDto {
  @ApiProperty()
  @IsString()
  petId: string;

  @ApiProperty({ example: 'Rabies' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'LOT-2026-TR' })
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  @IsISO8601()
  appliedAt: string;

  @ApiPropertyOptional({ example: '2027-04-29T10:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
