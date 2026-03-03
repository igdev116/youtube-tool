import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ping')
  ping() {
    const message = '✅ Server đang hoạt động';
    console.log(message);
    return message;
  }

  @Get('migrate-channel-groups')
  async runMigrationGet() {
    return this.appService.migrateChannelGroups();
  }

  @Post('migrate-channel-groups')
  async runMigrationPost() {
    return this.appService.migrateChannelGroups();
  }
}
