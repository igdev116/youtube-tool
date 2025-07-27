import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisConnectionService {
  getConnectionConfig() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      tls: {
        rejectUnauthorized: false,
      },
    };
  }
}
