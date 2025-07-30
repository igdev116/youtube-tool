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
          maxmemoryPolicy: 'allkeys-lru',
          ttl: 3600, // 1 giờ
        }
      : {
          host: 'localhost',
          port: 6379,
          maxmemoryPolicy: 'allkeys-lru',
          ttl: 3600, // 1 giờ
        };
  }
}
