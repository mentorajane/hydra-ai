import { Global, Module } from '@nestjs/common';
import { prisma } from '@hydra/database';

@Global()
@Module({
  providers: [
    {
      provide: 'PrismaClient',
      useValue: prisma,
    },
  ],
  exports: ['PrismaClient'],
})
export class PrismaModule {}
