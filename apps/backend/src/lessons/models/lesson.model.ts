import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum MediaType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'Type of media file',
});

@ObjectType()
export class MediaModel {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field(() => Int)
  size: number;

  @Field(() => MediaType)
  type: MediaType;

  @Field()
  url: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class LessonMediaModel {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number;

  @Field(() => MediaModel)
  media: MediaModel;
}

@ObjectType()
export class LessonModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int)
  order: number;

  @Field()
  moduleId: string;

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

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class LessonDetailModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int)
  order: number;

  @Field()
  moduleId: string;

  @Field()
  isDraft: boolean;

  @Field()
  isActive: boolean;

  @Field(() => [LessonMediaModel])
  media: LessonMediaModel[];

  @Field(() => Int)
  mediaCount: number;

  @Field(() => Int)
  assignmentCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class LessonResultModel {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
