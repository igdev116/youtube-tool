import { Module } from '@nestjs/common';
import { SimpleTestService } from './simple-test.service';
import { SimpleTestProcessorService } from './simple-test-processor.service';
import { SimpleTestController } from './simple-test.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [SimpleTestService, SimpleTestProcessorService],
  exports: [SimpleTestService],
  controllers: [SimpleTestController],
})
export class SimpleTestQueueModule {}
