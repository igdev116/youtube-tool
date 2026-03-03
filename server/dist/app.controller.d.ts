import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    ping(): string;
    runMigrationGet(): Promise<{
        success: boolean;
        logs: string[];
    }>;
    runMigrationPost(): Promise<{
        success: boolean;
        logs: string[];
    }>;
}
