import { IsOptional, IsString } from 'class-validator';

export class UpdateOwnerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
