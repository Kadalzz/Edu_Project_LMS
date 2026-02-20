import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

// ============================================
// ENUMS
// ============================================

export enum AssignmentType {
  QUIZ = 'QUIZ',
  TASK_ANALYSIS = 'TASK_ANALYSIS',
}

registerEnumType(AssignmentType, {
  name: 'AssignmentType',
  description: 'Type of assignment',
});

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

registerEnumType(SubmissionStatus, {
  name: 'SubmissionStatus',
  description: 'Status of submission',
});

export enum StepSubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(StepSubmissionStatus, {
  name: 'StepSubmissionStatus',
  description: 'Status of task step submission',
});

// ============================================
// QUIZ MODELS
// ============================================

@ObjectType()
export class QuizOptionModel {
  @Field(() => ID)
  id: string;

  @Field()
  optionKey: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  isCorrect: boolean;
}

@ObjectType()
export class QuizOptionStudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  optionKey: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  image?: string;

  // Note: isCorrect is NOT exposed to students
}

@ObjectType()
export class QuizQuestionModel {
  @Field(() => ID)
  id: string;

  @Field()
  question: string;

  @Field({ nullable: true })
  questionImage?: string;

  @Field(() => Int)
  order: number;

  @Field()
  assignmentId: string;

  @Field(() => [QuizOptionModel])
  options: QuizOptionModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class QuizQuestionStudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  question: string;

  @Field({ nullable: true })
  questionImage?: string;

  @Field(() => Int)
  order: number;

  @Field(() => [QuizOptionStudentModel])
  options: QuizOptionStudentModel[];
}

// ============================================
// TASK ANALYSIS MODELS
// ============================================

@ObjectType()
export class TaskStepModel {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  stepNumber: number;

  @Field()
  instruction: string;

  @Field({ nullable: true })
  referenceImage?: string;

  @Field()
  isMandatory: boolean;

  @Field()
  assignmentId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================
// ASSIGNMENT MODELS
// ============================================

@ObjectType()
export class AssignmentBasicModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => AssignmentType)
  type: AssignmentType;

  @Field()
  lessonId: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int)
  xpReward: number;
}

@ObjectType()
export class AssignmentModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AssignmentType)
  type: AssignmentType;

  @Field()
  lessonId: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int)
  xpReward: number;

  @Field()
  isDraft: boolean;

  @Field()
  isActive: boolean;

  @Field(() => [QuizQuestionModel], { nullable: true })
  quizQuestions?: QuizQuestionModel[];

  @Field(() => [TaskStepModel], { nullable: true })
  taskSteps?: TaskStepModel[];

  @Field(() => Int)
  questionCount: number;

  @Field(() => Int)
  submissionCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AssignmentDetailModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AssignmentType)
  type: AssignmentType;

  @Field()
  lessonId: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int)
  xpReward: number;

  @Field()
  isDraft: boolean;

  @Field()
  isActive: boolean;

  @Field(() => [QuizQuestionModel], { nullable: true })
  quizQuestions?: QuizQuestionModel[];

  @Field(() => [TaskStepModel], { nullable: true })
  taskSteps?: TaskStepModel[];

  @Field(() => Int)
  questionCount: number;

  @Field(() => Int)
  submissionCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Student view of assignment (no answers exposed)
@ObjectType()
export class AssignmentStudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AssignmentType)
  type: AssignmentType;

  @Field()
  lessonId: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int)
  xpReward: number;

  @Field(() => [QuizQuestionStudentModel], { nullable: true })
  quizQuestions?: QuizQuestionStudentModel[];

  @Field(() => [TaskStepModel], { nullable: true })
  taskSteps?: TaskStepModel[];

  @Field(() => Int)
  questionCount: number;
}

// ============================================
// SUBMISSION MODELS
// ============================================

@ObjectType()
export class QuizAnswerModel {
  @Field(() => ID)
  id: string;

  @Field()
  submissionId: string;

  @Field()
  questionId: string;

  @Field()
  selectedOption: string;

  @Field()
  isCorrect: boolean;

  @Field()
  answeredAt: Date;
}

@ObjectType()
export class StepSubmissionModel {
  @Field(() => ID)
  id: string;

  @Field()
  submissionId: string;

  @Field()
  stepId: string;

  @Field()
  photoUrl: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => StepSubmissionStatus)
  status: StepSubmissionStatus;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  submittedAt: Date;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field(() => TaskStepModel, { nullable: true })
  step?: TaskStepModel;
}

@ObjectType()
export class GradingModel {
  @Field(() => ID)
  id: string;

  @Field()
  submissionId: string;

  @Field(() => Float)
  score: number;

  @Field({ nullable: true })
  feedback?: string;

  @Field()
  gradedAt: Date;

  @Field()
  gradedById: string;
}

@ObjectType()
export class StudentInfoModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  totalXP: number;

  @Field({ nullable: true })
  studentName?: string;
}

@ObjectType()
export class SubmissionModel {
  @Field(() => ID)
  id: string;

  @Field()
  assignmentId: string;

  @Field()
  studentId: string;

  @Field(() => SubmissionStatus)
  status: SubmissionStatus;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field({ nullable: true })
  submittedAt?: Date;

  @Field({ nullable: true })
  gradedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => StudentInfoModel, { nullable: true })
  student?: StudentInfoModel;

  @Field(() => AssignmentBasicModel, { nullable: true })
  assignment?: AssignmentBasicModel;

  @Field(() => Int, { nullable: true })
  pendingStepsCount?: number;
}

@ObjectType()
export class SubmissionDetailModel {
  @Field(() => ID)
  id: string;

  @Field()
  assignmentId: string;

  @Field()
  studentId: string;

  @Field(() => SubmissionStatus)
  status: SubmissionStatus;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field({ nullable: true })
  submittedAt?: Date;

  @Field({ nullable: true })
  gradedAt?: Date;

  @Field(() => [QuizAnswerModel], { nullable: true })
  quizAnswers?: QuizAnswerModel[];

  @Field(() => [StepSubmissionModel], { nullable: true })
  stepSubmissions?: StepSubmissionModel[];

  @Field(() => GradingModel, { nullable: true })
  grading?: GradingModel;

  @Field(() => StudentInfoModel, { nullable: true })
  student?: StudentInfoModel;

  @Field(() => AssignmentModel, { nullable: true })
  assignment?: AssignmentModel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ResultModel {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class QuizResultModel {
  @Field(() => Float)
  score: number;

  @Field(() => Int)
  correctCount: number;

  @Field(() => Int)
  totalQuestions: number;

  @Field(() => Int)
  xpEarned: number;

  @Field()
  submissionId: string;
}

// ============================================
// SUBMISSION CONTEXT (for redirect shortcuts)
// ============================================

@ObjectType()
export class SubmissionContextSubjectModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  classroomId: string;
}

@ObjectType()
export class SubmissionContextModuleModel {
  @Field(() => String)
  id: string;

  @Field(() => SubmissionContextSubjectModel)
  subject: SubmissionContextSubjectModel;
}

@ObjectType()
export class SubmissionContextLessonModel {
  @Field(() => String)
  id: string;

  @Field(() => SubmissionContextModuleModel)
  module: SubmissionContextModuleModel;
}

@ObjectType()
export class SubmissionContextAssignmentModel {
  @Field(() => String)
  id: string;

  @Field(() => SubmissionContextLessonModel)
  lesson: SubmissionContextLessonModel;
}

@ObjectType()
export class SubmissionContextModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => SubmissionContextAssignmentModel)
  assignment: SubmissionContextAssignmentModel;
}

