import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudentModel } from '../auth/models/user.model';
import {
  CreateClassroomInput,
  UpdateClassroomInput,
  EnrollStudentInput,
  UnenrollStudentInput,
} from './dto/classroom.input';
import {
  ClassroomListModel,
  ClassroomDetailModel,
  EnrollmentResultModel,
} from './models/classroom-detail.model';

@Resolver()
export class ClassroomsResolver {
  constructor(private readonly classroomsService: ClassroomsService) {}

  // ============================================
  // CLASSROOM CRUD
  // ============================================

  @Mutation(() => ClassroomListModel, { description: 'Create a new classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async createClassroom(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateClassroomInput,
  ): Promise<ClassroomListModel> {
    return this.classroomsService.createClassroom(input, user.id) as any;
  }

  @Mutation(() => ClassroomListModel, { description: 'Update classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async updateClassroom(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateClassroomInput,
  ): Promise<ClassroomListModel> {
    return this.classroomsService.updateClassroom(input, user.id) as any;
  }

  @Mutation(() => EnrollmentResultModel, { description: 'Delete classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async deleteClassroom(
    @CurrentUser() user: { id: string },
    @Args('classroomId') classroomId: string,
  ): Promise<EnrollmentResultModel> {
    return this.classroomsService.deleteClassroom(classroomId, user.id) as any;
  }

  @Query(() => [ClassroomListModel], { description: 'Get all classrooms for current teacher' })
  @UseGuards(GqlAuthGuard)
  async classrooms(
    @CurrentUser() user: { id: string },
  ): Promise<ClassroomListModel[]> {
    return this.classroomsService.getClassroomsByTeacher(user.id) as any;
  }

  @Query(() => ClassroomDetailModel, { description: 'Get classroom detail with students & subjects' })
  @UseGuards(GqlAuthGuard)
  async classroomDetail(
    @CurrentUser() user: { id: string },
    @Args('classroomId') classroomId: string,
  ): Promise<ClassroomDetailModel> {
    return this.classroomsService.getClassroomDetail(classroomId, user.id) as any;
  }

  // ============================================
  // STUDENT ENROLLMENT
  // ============================================

  @Mutation(() => EnrollmentResultModel, { description: 'Enroll student in classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async enrollStudent(
    @CurrentUser() user: { id: string },
    @Args('input') input: EnrollStudentInput,
  ): Promise<EnrollmentResultModel> {
    return this.classroomsService.enrollStudent(input, user.id) as any;
  }

  @Mutation(() => EnrollmentResultModel, { description: 'Remove student from classroom (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async unenrollStudent(
    @CurrentUser() user: { id: string },
    @Args('input') input: UnenrollStudentInput,
  ): Promise<EnrollmentResultModel> {
    return this.classroomsService.unenrollStudent(input, user.id) as any;
  }

  @Query(() => [StudentModel], { description: 'Get students not yet enrolled in a classroom' })
  @UseGuards(GqlAuthGuard)
  async availableStudents(
    @CurrentUser() user: { id: string },
    @Args('classroomId') classroomId: string,
  ): Promise<StudentModel[]> {
    return this.classroomsService.getAvailableStudents(classroomId, user.id) as any;
  }
}
