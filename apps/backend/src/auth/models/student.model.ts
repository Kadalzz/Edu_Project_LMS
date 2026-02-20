import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserBasicModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  studentName?: string;

  @Field({ nullable: true })
  parentName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class StudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => UserBasicModel)
  user: UserBasicModel;

  @Field()
  level: number;

  @Field()
  totalXP: number;

  @Field()
  currentXP: number;

  @Field()
  createdAt: Date;
}
