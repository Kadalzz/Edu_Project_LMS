import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateDailyReportInput, UpdateDailyReportInput, AddCommentInput } from './dto/daily-report.input';
import { DailyReportModel, DailyReportCommentModel } from './models/daily-report.model';

@Resolver()
export class DailyReportsResolver {
  constructor(private readonly dailyReportsService: DailyReportsService) {}

  @Mutation(() => DailyReportModel, { description: 'Create a daily report (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async createDailyReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateDailyReportInput,
  ): Promise<DailyReportModel> {
    return this.dailyReportsService.createDailyReport(input, user.id);
  }

  @Mutation(() => DailyReportModel, { description: 'Update a daily report (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async updateDailyReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateDailyReportInput,
  ): Promise<DailyReportModel> {
    return this.dailyReportsService.updateDailyReport(input, user.id);
  }

  @Mutation(() => DailyReportModel, { description: 'Delete a daily report (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async deleteDailyReport(
    @CurrentUser() user: { id: string },
    @Args('reportId') reportId: string,
  ) {
    return this.dailyReportsService.deleteDailyReport(reportId, user.id);
  }

  @Query(() => [DailyReportModel], { description: 'Get daily reports for a student' })
  @UseGuards(GqlAuthGuard)
  async dailyReportsByStudent(
    @CurrentUser() user: { id: string },
    @Args('studentId') studentId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<DailyReportModel[]> {
    return this.dailyReportsService.getDailyReportsByStudent(studentId, user.id, startDate, endDate);
  }

  @Query(() => DailyReportModel, { description: 'Get daily report detail' })
  @UseGuards(GqlAuthGuard)
  async dailyReportDetail(
    @CurrentUser() user: { id: string },
    @Args('reportId') reportId: string,
  ): Promise<DailyReportModel> {
    return this.dailyReportsService.getDailyReportDetail(reportId, user.id);
  }

  @Mutation(() => DailyReportCommentModel, { description: 'Add comment to daily report' })
  @UseGuards(GqlAuthGuard)
  async addDailyReportComment(
    @CurrentUser() user: { id: string },
    @Args('input') input: AddCommentInput,
  ): Promise<DailyReportCommentModel> {
    return this.dailyReportsService.addComment(input, user.id);
  }
}
