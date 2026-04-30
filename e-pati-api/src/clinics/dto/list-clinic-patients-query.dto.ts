import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListClinicPatientsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Misket' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Cat' })
  @IsOptional()
  @IsString()
  species?: string;
}
