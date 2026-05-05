import { IsOptional, IsString } from 'class-validator';

export class RequestAppointmentDto {
  @IsString()
  petId!: string;

  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsString()
  preferredDate!: string;

  @IsString()
  preferredTime!: string;

  @IsString()
  reason!: string;
}
