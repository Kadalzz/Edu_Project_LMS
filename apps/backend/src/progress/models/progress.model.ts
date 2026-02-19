import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ProgressModel {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;

  @Field()
  subjectId: string;

  @Field({ nullable: true })
  lessonId?: string;

  @Field()
  completed: boolean;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SubjectProgressModel {
  @Field(() => ID)
  subjectId: string;

  @Field()
  subjectName: string;

  @Field({ nullable: true })
  subjectIcon?: string;

  @Field({ nullable: true })
  subjectColor?: string;

  @Field(() => Int)
  totalLessons: number;

  @Field(() => Int)
  completedLessons: number;

  @Field(() => Float)
  completionPercentage: number;
}

@ObjectType()
export class StudentStatsModel {
  @Field(() => ID)
  studentId: string;

  @Field()
  studentName: string;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  totalXP: number;

  @Field(() => Int)
  currentXP: number;

  @Field(() => Int)
  xpToNextLevel: number;

  @Field(() => Float)
  levelProgress: number; // 0-100 percentage to next level

  @Field(() => Int)
  totalAssignmentsCompleted: number;

  @Field(() => Int)
  totalQuizzesCompleted: number;

  @Field(() => Int)
  totalTasksCompleted: number;

  @Field(() => Float)
  averageScore: number;

  @Field(() => [SubjectProgressModel])
  subjectProgress: SubjectProgressModel[];
}

@ObjectType()
export class LevelInfoModel {
  @Field(() => Int)
  currentLevel: number;

  @Field(() => Int)
  currentXP: number;

  @Field(() => Int)
  totalXP: number;

  @Field(() => Int)
  xpToNextLevel: number;

  @Field(() => Float)
  progressPercentage: number;
}
