import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HydrationModule } from './hydration/hydration.module';
import { GoalsModule } from './goals/goals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { GamificationModule } from './gamification/gamification.module';
import { WeatherModule } from './weather/weather.module';
import { FamilyModule } from './family/family.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HydrationModule,
  ],
})
export class AppModule {}
