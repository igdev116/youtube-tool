import { OnModuleInit } from '@nestjs/common';
import { SimpleTestService } from './simple-test.service';
export declare class SimpleTestProcessorService implements OnModuleInit {
    private readonly simpleTestService;
    private readonly logger;
    private worker;
    constructor(simpleTestService: SimpleTestService);
    onModuleInit(): void;
}
