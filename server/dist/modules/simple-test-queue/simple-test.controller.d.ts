import { SimpleTestService } from './simple-test.service';
export declare class SimpleTestController {
    private readonly simpleTestService;
    constructor(simpleTestService: SimpleTestService);
    addOrders(): Promise<{
        success: boolean;
        message: string;
        orders: number[];
    }>;
    getStatus(): Promise<{
        success: boolean;
        status: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            total: number;
        };
    }>;
    clearQueue(): Promise<{
        success: boolean;
        message: string;
    }>;
    resetCounter(): Promise<{
        success: boolean;
        message: string;
    }>;
}
