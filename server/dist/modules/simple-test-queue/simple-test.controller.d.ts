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
        status: any;
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
