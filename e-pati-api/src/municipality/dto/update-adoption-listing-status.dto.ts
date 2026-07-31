import { ApiProperty } from '@nestjs/swagger';
import { AdoptionListingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAdoptionListingStatusDto {
  @ApiProperty({ enum: AdoptionListingStatus })
  @IsEnum(AdoptionListingStatus)
  status!: AdoptionListingStatus;
}
