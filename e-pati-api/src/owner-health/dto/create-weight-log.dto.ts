import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWeightLogDto {
  @IsString()
  petId!: string;

  @IsNumber()
  @Min(0.1)
  weightKg!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  bodyConditionScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
