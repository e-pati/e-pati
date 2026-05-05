import { IsOptional, IsString } from 'class-validator';

export class CreatePrivacyRequestDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  message?: string;
}
