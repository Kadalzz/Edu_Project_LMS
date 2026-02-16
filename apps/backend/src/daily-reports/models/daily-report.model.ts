import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

// ============================================
// ENUMS
// ============================================

export enum Mood {
  VERY_SAD = 'VERY_SAD',
  SAD = 'SAD',
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  VERY_HAPPY = 'VERY_HAPPY',
}

registerEnumType(Mood, {
  name: 'Mood',
  description: 'Mood of the student',
});

// ============================================
// DAILY REPORT MODELS
// ============================================

@ObjectType()
export class DailyReportAuthorModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  role: string;
}

@ObjectType()
export class DailyReportCommentModel {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  dailyReportId: string;

  @Field()
  commentedById: string;

  @Field(() => DailyReportAuthorModel)
  commentedBy: DailyReportAuthorModel;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class DailyReportModel {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;

  @Field()
  studentId: string;

  @Field()
  createdById: string;

  @Field(() => DailyReportAuthorModel)
  createdBy: DailyReportAuthorModel;

  @Field(() => Mood)
  mood: Mood;

  @Field(() => [String])
  activities: string[];

  @Field({ nullable: true })
  achievements?: string;

  @Field({ nullable: true })
  challenges?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [DailyReportCommentModel])
  comments: DailyReportCommentModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
