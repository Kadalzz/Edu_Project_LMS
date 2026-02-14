import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserModel } from '../auth/models/user.model';
import { CreateStudentInput, UpdateProfileInput } from './dto/user.input';
import { StudentWithUser, ClassroomModel } from './models/classroom.model';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => UserModel, { description: 'Teacher creates a student account' })
  @UseGuards(GqlAuthGuard)
  async createStudent(
    @CurrentUser() user: { id: string; role: string },
    @Args('input') input: CreateStudentInput,
  ): Promise<UserModel> {
    return this.usersService.createStudent(input, user.id) as any;
  }

  @Query(() => [StudentWithUser], { description: 'Get all students for current teacher' })
  @UseGuards(GqlAuthGuard)
  async myStudents(
    @CurrentUser() user: { id: string },
  ): Promise<StudentWithUser[]> {
    return this.usersService.getStudentsByTeacher(user.id) as any;
  }

  @Query(() => [ClassroomModel], { description: 'Get classrooms for current teacher' })
  @UseGuards(GqlAuthGuard)
  async myClassrooms(
    @CurrentUser() user: { id: string },
  ): Promise<ClassroomModel[]> {
    const classrooms = await this.usersService.getClassrooms(user.id);
    return classrooms.map((c) => ({
      ...c,
      studentCount: c._count.students,
      subjectCount: c._count.subjects,
    })) as any;
  }

  @Mutation(() => UserModel, { description: 'Update own profile' })
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserModel> {
    return this.usersService.updateProfile(user.id, input) as any;
  }

  @Mutation(() => UserModel, { description: 'Toggle student active status' })
  @UseGuards(GqlAuthGuard)
  async toggleStudentActive(
    @CurrentUser() user: { id: string },
    @Args('studentUserId') studentUserId: string,
  ): Promise<UserModel> {
    return this.usersService.toggleStudentActive(studentUserId, user.id) as any;
  }
}
