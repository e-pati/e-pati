import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @ApiCreatedResponse({ description: 'Presigned R2 upload URL created.' })
  createPresignedUpload(@Body() dto: CreatePresignedUploadDto) {
    return this.uploadsService.createPresignedUpload(dto);
  }
}
