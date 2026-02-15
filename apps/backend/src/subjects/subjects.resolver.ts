import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSubjectInput, UpdateSubjectInput } from './dto/subject.input';
import {
  SubjectModel,
  SubjectDetailModel,
  SubjectResultModel,
} from './models/subject.model';

@Resolver()
export class SubjectsResolver {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Mutation(() => SubjectModel, { description: 'Create a new subject in classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async createSubject(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateSubjectInput,
  ): Promise<SubjectModel> {
    return this.subjectsService.createSubject(input, user.id) as any;
  }

  @Mutation(() => SubjectModel, { description: 'Update subject (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async updateSubject(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateSubjectInput,
  ): Promise<SubjectModel> {
    return this.subjectsService.updateSubject(input, user.id) as any;
  }

  @Mutation(() => SubjectResultModel, { description: 'Delete subject (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async deleteSubject(
    @CurrentUser() user: { id: string },
    @Args('subjectId') subjectId: string,
  ): Promise<SubjectResultModel> {
    return this.subjectsService.deleteSubject(subjectId, user.id) as any;
  }

  @Query(() => [SubjectModel], { description: 'Get subjects for a classroom' })
  @UseGuards(GqlAuthGuard)
  async subjects(
    @CurrentUser() user: { id: string },
    @Args('classroomId') classroomId: string,
  ): Promise<SubjectModel[]> {
    return this.subjectsService.getSubjectsByClassroom(classroomId, user.id) as any;
  }

  @Query(() => SubjectDetailModel, { description: 'Get subject detail with modules' })
  @UseGuards(GqlAuthGuard)
  async subjectDetail(
    @CurrentUser() user: { id: string },
    @Args('subjectId') subjectId: string,
  ): Promise<SubjectDetailModel> {
    return this.subjectsService.getSubjectDetail(subjectId, user.id) as any;
  }
}
