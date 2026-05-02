import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';

const SIGNED_URL_TTL_SECONDS = 15 * 60;

@Injectable()
export class UploadsService {
  private client?: S3Client;

  constructor(private readonly configService: ConfigService) {}

  async createPresignedUpload(dto: CreatePresignedUploadDto) {
    const key = this.createObjectKey(dto.folder ?? 'lab-results', dto.fileName);
    const expiresIn = this.getSignedUrlTtl();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const uploadUrl = await getSignedUrl(
      this.getClient(),
      new PutObjectCommand({
        Bucket: this.getBucket(),
        Key: key,
        ContentType: dto.mimeType,
      }),
      { expiresIn },
    );

    return {
      key,
      uploadUrl,
      fileUrl: this.getObjectUrl(key),
      expiresAt,
    };
  }

  async createPresignedDownloadUrl(fileUrl: string): Promise<string | null> {
    const key = this.getObjectKeyFromUrl(fileUrl);

    if (!key) {
      return null;
    }

    return getSignedUrl(
      this.getClient(),
      new GetObjectCommand({
        Bucket: this.getBucket(),
        Key: key,
      }),
      { expiresIn: this.getSignedUrlTtl() },
    );
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: this.getEndpoint(),
        credentials: {
          accessKeyId: this.getRequiredConfig('R2_ACCESS_KEY_ID'),
          secretAccessKey: this.getRequiredConfig('R2_SECRET_ACCESS_KEY'),
        },
      });
    }

    return this.client;
  }

  private createObjectKey(folder: string, fileName: string): string {
    const safeName = fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 120);

    return `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
  }

  private getObjectUrl(key: string): string {
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');

    if (publicBaseUrl) {
      return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    return `${this.getEndpoint()}/${this.getBucket()}/${key}`;
  }

  private getObjectKeyFromUrl(fileUrl: string): string | null {
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');

    if (publicBaseUrl && fileUrl.startsWith(publicBaseUrl)) {
      return fileUrl.slice(publicBaseUrl.replace(/\/$/, '').length + 1);
    }

    const objectUrlPrefix = `${this.getEndpoint()}/${this.getBucket()}/`;

    if (fileUrl.startsWith(objectUrlPrefix)) {
      return fileUrl.slice(objectUrlPrefix.length);
    }

    return null;
  }

  private getEndpoint(): string {
    return `https://${this.getRequiredConfig('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  }

  private getBucket(): string {
    return this.getRequiredConfig('R2_BUCKET');
  }

  private getSignedUrlTtl(): number {
    return Number(
      this.configService.get<string>('R2_SIGNED_URL_TTL_SECONDS') ??
        SIGNED_URL_TTL_SECONDS,
    );
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured.`);
    }

    return value;
  }
}
