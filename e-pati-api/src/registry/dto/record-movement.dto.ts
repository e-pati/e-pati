import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementReason } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class RecordMovementDto {
  @ApiProperty({ enum: MovementReason })
  @IsEnum(MovementReason)
  reason!: MovementReason;

  @ApiProperty()
  @IsDateString()
  occurredAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromPremiseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toPremiseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
