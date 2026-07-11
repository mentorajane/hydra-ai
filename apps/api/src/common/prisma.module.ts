import { Global, Module } from '@nestjs/common';
import { prisma } from './prisma';

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
