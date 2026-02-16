import { Module } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { DailyReportsResolver } from './daily-reports.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [DailyReportsService, DailyReportsResolver, PrismaService],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
