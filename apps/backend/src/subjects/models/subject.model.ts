import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class SubjectModel {
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
  classroomId: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  moduleCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SubjectDetailModel {
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
  classroomId: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  moduleCount: number;

  @Field(() => [ModuleSummaryModel])
  modules: ModuleSummaryModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ModuleSummaryModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  lessonCount: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class SubjectResultModel {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
