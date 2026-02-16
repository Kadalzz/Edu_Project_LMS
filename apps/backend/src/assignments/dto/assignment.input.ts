import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// ASSIGNMENT INPUTS
// ============================================

@InputType()
export class CreateAssignmentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  type: string; // QUIZ or TASK_ANALYSIS

  @Field()
  @IsNotEmpty()
  @IsString()
  lessonId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

@InputType()
export class UpdateAssignmentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// QUIZ QUESTION INPUTS
// ============================================

@InputType()
export class QuizOptionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  optionKey: string; // A, B, C, D

  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field()
  @IsBoolean()
  isCorrect: boolean;
}

@InputType()
export class AddQuizQuestionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  assignmentId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  question: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  questionImage?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field(() => [QuizOptionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionInput)
  options: QuizOptionInput[];
}

@InputType()
export class UpdateQuizQuestionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  question?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  questionImage?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field(() => [QuizOptionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionInput)
  options?: QuizOptionInput[];
}

// ============================================
// TASK STEP INPUTS
// ============================================

@InputType()
export class AddTaskStepInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  assignmentId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  stepNumber: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  instruction: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceImage?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}

@InputType()
export class UpdateTaskStepInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  stepNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instruction?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}

// ============================================
// SUBMISSION INPUTS
// ============================================

@InputType()
export class SubmitQuizAnswerInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  selectedOption: string; // A, B, C, or D
}

@InputType()
export class SubmitTaskStepInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  stepId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  photoUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}

@InputType()
export class GradeSubmissionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string;
}

@InputType()
export class ReviewTaskStepInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  stepSubmissionId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  status: string; // APPROVED or REJECTED

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}
