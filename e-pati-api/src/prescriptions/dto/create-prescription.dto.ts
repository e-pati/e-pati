import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class MedicationDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '50mg' })
  @IsString()
  dose: string;

  @ApiProperty({ example: 'Twice daily' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  duration: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty()
  @IsString()
  petId: string;

  @ApiPropertyOptional({ example: 'Upper respiratory infection' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [MedicationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];
}
