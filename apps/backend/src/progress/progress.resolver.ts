import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ProgressModel,
  StudentStatsModel,
  LevelInfoModel,
  SubjectProgressModel,
} from './models/progress.model';

@Resolver()
export class ProgressResolver {
  constructor(private readonly progressService: ProgressService) {}

  @Mutation(() => ProgressModel, { description: 'Mark lesson as completed (Student)' })
  @UseGuards(GqlAuthGuard)
  async markLessonComplete(
    @CurrentUser() user: { id: string },
    @Args('lessonId') lessonId: string,
  ): Promise<ProgressModel> {
    // Get student from user
    const student = await this.progressService['prisma'].student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      throw new Error('Student profile tidak ditemukan');
    }

    return this.progressService.markLessonComplete(lessonId, student.id) as any;
  }

  @Query(() => StudentStatsModel, { description: 'Get student statistics & progress' })
  @UseGuards(GqlAuthGuard)
  async studentStats(
    @CurrentUser() user: { id: string },
    @Args('studentId') studentId: string,
  ): Promise<StudentStatsModel> {
    return this.progressService.getStudentStats(studentId, user.id) as any;
  }

  @Query(() => LevelInfoModel, { description: 'Get student level info' })
  @UseGuards(GqlAuthGuard)
  async levelInfo(
    @CurrentUser() user: { id: string },
    @Args('studentId') studentId: string,
  ): Promise<LevelInfoModel> {
    return this.progressService.getLevelInfo(studentId, user.id) as any;
  }

  @Query(() => SubjectProgressModel, { description: 'Get progress for a specific subject' })
  @UseGuards(GqlAuthGuard)
  async subjectProgress(
    @CurrentUser() user: { id: string },
    @Args('studentId') studentId: string,
    @Args('subjectId') subjectId: string,
  ): Promise<SubjectProgressModel> {
    return this.progressService.getSubjectProgress(studentId, subjectId, user.id) as any;
  }
}
