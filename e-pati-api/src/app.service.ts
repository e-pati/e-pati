import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getLiveStatus() {
    return this.status('ok');
  }

  async getReadyStatus() {
    await this.prisma.$queryRaw`SELECT 1`;
    return this.status('ready');
  }

  private status(status: 'ok' | 'ready') {
    return {
      status,
      service: 'e-pati-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
