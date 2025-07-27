import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisConnectionService {
  getConnectionConfig() {
    return process.env.NODE_ENV === 'production'
      ? {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          username: process.env.REDIS_USERNAME,
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: 'localhost',
          port: 6379,
        };
  }
}
