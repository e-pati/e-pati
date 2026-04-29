import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateExaminationDto {
  @ApiProperty()
  @IsString()
  petId: string;

  @ApiProperty({ example: 'Appetite loss and fatigue' })
  @IsString()
  @MinLength(2)
  complaint: string;

  @ApiProperty({ example: 'Mild dehydration, normal temperature' })
  @IsString()
  @MinLength(2)
  findings: string;

  @ApiProperty({ example: 'Suspected gastrointestinal irritation' })
  @IsString()
  @MinLength(2)
  assessment: string;

  @ApiProperty({ example: 'Diet change and follow-up in 3 days' })
  @IsString()
  @MinLength(2)
  plan: string;
}
