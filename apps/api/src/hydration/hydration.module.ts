import { Module, forwardRef } from '@nestjs/common';
import { HydrationController } from './hydration.controller';
import { HydrationService } from './hydration.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [forwardRef(() => AiModule)],
  controllers: [HydrationController],
  providers: [HydrationService],
  exports: [HydrationService],
})
export class HydrationModule {}
