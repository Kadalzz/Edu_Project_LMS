import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserModel, StudentModel } from '../../auth/models/user.model';

@ObjectType()
export class ClassroomDetailModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  studentCount: number;

  @Field(() => Int)
  subjectCount: number;

  @Field(() => [EnrolledStudentModel])
  students: EnrolledStudentModel[];

  @Field(() => [SubjectSummaryModel])
  subjects: SubjectSummaryModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class EnrolledStudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  enrolledAt: Date;

  @Field(() => StudentModel)
  student: StudentModel;
}

@ObjectType()
export class SubjectSummaryModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  moduleCount: number;
}

@ObjectType()
export class ClassroomListModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  studentCount: number;

  @Field(() => Int)
  subjectCount: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class EnrollmentResultModel {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
