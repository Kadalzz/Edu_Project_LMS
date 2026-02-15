import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class ModuleModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field()
  subjectId: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  lessonCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ModuleDetailModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field()
  subjectId: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  lessonCount: number;

  @Field(() => [LessonSummaryModel])
  lessons: LessonSummaryModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class LessonSummaryModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field()
  isDraft: boolean;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  mediaCount: number;

  @Field(() => Int)
  assignmentCount: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ModuleResultModel {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
