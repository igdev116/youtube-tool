export declare class RedisConnectionService {
    getConnectionConfig(): {
        host: string | undefined;
        port: number;
        password: string | undefined;
        username: string | undefined;
        tls: {
            rejectUnauthorized: boolean;
        };
    } | {
        host: string;
        port: number;
        password?: undefined;
        username?: undefined;
        tls?: undefined;
    };
}
