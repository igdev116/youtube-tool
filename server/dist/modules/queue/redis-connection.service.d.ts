export declare class RedisConnectionService {
    getConnectionConfig(): {
        host: string | undefined;
        port: number;
        password: string | undefined;
        username: string | undefined;
        tls: {
            rejectUnauthorized: boolean;
        };
        maxmemoryPolicy: string;
        ttl: number;
    } | {
        host: string;
        port: number;
        maxmemoryPolicy: string;
        ttl: number;
        password?: undefined;
        username?: undefined;
        tls?: undefined;
    };
}
