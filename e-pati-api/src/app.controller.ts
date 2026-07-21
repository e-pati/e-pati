import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getLiveStatus();
  }

  @Get('health/live')
  getLive() {
    return this.appService.getLiveStatus();
  }

  @Get('health/ready')
  getReady() {
    return this.appService.getReadyStatus();
  }
}
