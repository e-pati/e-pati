import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListPrescriptionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'pet-123' })
  @IsOptional()
  @IsString()
  petId?: string;
}
