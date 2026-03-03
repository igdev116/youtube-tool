import { Connection } from 'mongoose';
export declare class AppService {
    private connection;
    constructor(connection: Connection);
    getHello(): string;
    migrateChannelGroups(): Promise<{
        success: boolean;
        logs: string[];
    }>;
}
