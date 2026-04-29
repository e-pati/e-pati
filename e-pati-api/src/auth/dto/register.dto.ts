import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Erol Tabakoglu' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: 'sahip@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+905551112233' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  password: string;
}
