import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @ApiPropertyOptional({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
