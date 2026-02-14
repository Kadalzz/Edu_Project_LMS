import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT_PARENT = 'STUDENT_PARENT',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles in the system',
});

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  studentName?: string;

  @Field({ nullable: true })
  parentName?: string;

  @Field({ nullable: true })
  teacherName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  isActive: boolean;

  @Field()
  isVerified: boolean;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class StudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field()
  level: number;

  @Field()
  totalXP: number;

  @Field()
  currentXP: number;

  @Field()
  createdAt: Date;
}
