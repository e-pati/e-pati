import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ClaimPetDto {
  @ApiProperty({ example: '900182000123456' })
  @IsString()
  @MinLength(3)
  microchipNo: string;
}
