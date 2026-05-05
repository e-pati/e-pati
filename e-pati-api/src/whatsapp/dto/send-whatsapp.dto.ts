import { IsObject, IsOptional, IsString } from 'class-validator';

export class SendWhatsAppDto {
  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @IsString()
  petId?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}
