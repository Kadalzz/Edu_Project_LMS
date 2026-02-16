import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

// ============================================
// NOTE MODELS
// ============================================

@ObjectType()
export class NoteAuthorModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  role: string;
}

@ObjectType()
export class NoteModel {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  studentId: string;

  @Field()
  writtenById: string;

  @Field(() => NoteAuthorModel)
  writtenBy: NoteAuthorModel;

  @Field({ nullable: true })
  parentNoteId?: string;

  @Field(() => Int)
  replyCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class NoteWithRepliesModel {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  studentId: string;

  @Field()
  writtenById: string;

  @Field(() => NoteAuthorModel)
  writtenBy: NoteAuthorModel;

  @Field({ nullable: true })
  parentNoteId?: string;

  @Field(() => [NoteWithRepliesModel])
  replies: NoteWithRepliesModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
