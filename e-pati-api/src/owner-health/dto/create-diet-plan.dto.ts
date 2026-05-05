import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDietPlanDto {
  @IsString()
  petId!: string;

  @IsString()
  foodName!: string;

  @IsInt()
  @Min(1)
  dailyAmountGrams!: number;

  @IsInt()
  @Min(1)
  mealsPerDay!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
