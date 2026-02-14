import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserModel } from '../../auth/models/user.model';

@ObjectType()
export class ClassroomModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  studentCount?: number;

  @Field(() => Int, { nullable: true })
  subjectCount?: number;
}

@ObjectType()
export class StudentWithUser {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  totalXP: number;

  @Field(() => Int)
  currentXP: number;

  @Field()
  createdAt: Date;

  @Field(() => ClassroomModel, { nullable: true })
  classroom?: ClassroomModel;
}
