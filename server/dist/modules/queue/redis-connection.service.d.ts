export declare class RedisConnectionService {
    getConnectionConfig(): {
        host: string;
        port: number;
        password: string | undefined;
        username: string | undefined;
        tls: {
            rejectUnauthorized: boolean;
        };
    };
}
