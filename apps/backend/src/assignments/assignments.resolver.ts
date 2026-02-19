import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AddQuizQuestionInput,
  UpdateQuizQuestionInput,
  AddTaskStepInput,
  UpdateTaskStepInput,
  SubmitQuizAnswerInput,
  SubmitTaskStepInput,
  GradeSubmissionInput,
  ReviewTaskStepInput,
} from './dto/assignment.input';
import {
  AssignmentModel,
  AssignmentDetailModel,
  AssignmentStudentModel,
  QuizQuestionModel,
  TaskStepModel,
  SubmissionModel,
  SubmissionDetailModel,
  QuizAnswerModel,
  StepSubmissionModel,
  GradingModel,
  ResultModel,
  QuizResultModel,
  SubmissionContextModel,
} from './models/assignment.model';

@Resolver()
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // ============================================
  // ASSIGNMENT CRUD (Teacher)
  // ============================================

  @Mutation(() => AssignmentModel, { description: 'Create assignment (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async createAssignment(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateAssignmentInput,
  ): Promise<AssignmentModel> {
    return this.assignmentsService.createAssignment(input, user.id) as any;
  }

  @Mutation(() => AssignmentModel, { description: 'Update assignment (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async updateAssignment(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateAssignmentInput,
  ): Promise<AssignmentModel> {
    return this.assignmentsService.updateAssignment(input, user.id) as any;
  }

  @Mutation(() => ResultModel, { description: 'Delete assignment (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async deleteAssignment(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<ResultModel> {
    return this.assignmentsService.deleteAssignment(assignmentId, user.id) as any;
  }

  @Mutation(() => AssignmentModel, { description: 'Toggle assignment draft (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async toggleAssignmentDraft(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<AssignmentModel> {
    return this.assignmentsService.toggleAssignmentDraft(assignmentId, user.id) as any;
  }

  // ============================================
  // QUIZ QUESTIONS (Teacher)
  // ============================================

  @Mutation(() => QuizQuestionModel, { description: 'Add quiz question (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async addQuizQuestion(
    @CurrentUser() user: { id: string },
    @Args('input') input: AddQuizQuestionInput,
  ): Promise<QuizQuestionModel> {
    return this.assignmentsService.addQuizQuestion(input, user.id) as any;
  }

  @Mutation(() => QuizQuestionModel, { description: 'Update quiz question (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async updateQuizQuestion(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateQuizQuestionInput,
  ): Promise<QuizQuestionModel> {
    return this.assignmentsService.updateQuizQuestion(input, user.id) as any;
  }

  @Mutation(() => ResultModel, { description: 'Delete quiz question (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async deleteQuizQuestion(
    @CurrentUser() user: { id: string },
    @Args('questionId') questionId: string,
  ): Promise<ResultModel> {
    return this.assignmentsService.deleteQuizQuestion(questionId, user.id) as any;
  }

  // ============================================
  // TASK STEPS (Teacher)
  // ============================================

  @Mutation(() => TaskStepModel, { description: 'Add task step (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async addTaskStep(
    @CurrentUser() user: { id: string },
    @Args('input') input: AddTaskStepInput,
  ): Promise<TaskStepModel> {
    return this.assignmentsService.addTaskStep(input, user.id) as any;
  }

  @Mutation(() => TaskStepModel, { description: 'Update task step (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async updateTaskStep(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateTaskStepInput,
  ): Promise<TaskStepModel> {
    return this.assignmentsService.updateTaskStep(input, user.id) as any;
  }

  @Mutation(() => ResultModel, { description: 'Delete task step (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async deleteTaskStep(
    @CurrentUser() user: { id: string },
    @Args('stepId') stepId: string,
  ): Promise<ResultModel> {
    return this.assignmentsService.deleteTaskStep(stepId, user.id) as any;
  }

  // ============================================
  // SUBMISSIONS (Student)
  // ============================================

  @Mutation(() => SubmissionModel, { description: 'Start a submission (Student)' })
  @UseGuards(GqlAuthGuard)
  async startSubmission(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<SubmissionModel> {
    return this.assignmentsService.startSubmission(assignmentId, user.id) as any;
  }

  @Mutation(() => QuizAnswerModel, { description: 'Submit quiz answer (Student)' })
  @UseGuards(GqlAuthGuard)
  async submitQuizAnswer(
    @CurrentUser() user: { id: string },
    @Args('input') input: SubmitQuizAnswerInput,
  ): Promise<QuizAnswerModel> {
    return this.assignmentsService.submitQuizAnswer(input, user.id) as any;
  }

  @Mutation(() => QuizResultModel, { description: 'Complete quiz submission & auto-grade (Student)' })
  @UseGuards(GqlAuthGuard)
  async completeQuizSubmission(
    @CurrentUser() user: { id: string },
    @Args('submissionId') submissionId: string,
  ): Promise<QuizResultModel> {
    return this.assignmentsService.completeQuizSubmission(submissionId, user.id) as any;
  }

  @Mutation(() => StepSubmissionModel, { description: 'Submit task step evidence (Student)' })
  @UseGuards(GqlAuthGuard)
  async submitTaskStep(
    @CurrentUser() user: { id: string },
    @Args('input') input: SubmitTaskStepInput,
  ): Promise<StepSubmissionModel> {
    return this.assignmentsService.submitTaskStep(input, user.id) as any;
  }

  @Mutation(() => SubmissionModel, { description: 'Complete task submission (Student)' })
  @UseGuards(GqlAuthGuard)
  async completeTaskSubmission(
    @CurrentUser() user: { id: string },
    @Args('submissionId') submissionId: string,
  ): Promise<SubmissionModel> {
    return this.assignmentsService.completeTaskSubmission(submissionId, user.id) as any;
  }

  // ============================================
  // GRADING (Teacher)
  // ============================================

  @Mutation(() => GradingModel, { description: 'Grade a submission (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async gradeSubmission(
    @CurrentUser() user: { id: string },
    @Args('input') input: GradeSubmissionInput,
  ): Promise<GradingModel> {
    return this.assignmentsService.gradeSubmission(input, user.id) as any;
  }

  @Mutation(() => StepSubmissionModel, { description: 'Review task step (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async reviewTaskStep(
    @CurrentUser() user: { id: string },
    @Args('input') input: ReviewTaskStepInput,
  ): Promise<StepSubmissionModel> {
    return this.assignmentsService.reviewTaskStep(input, user.id) as any;
  }

  // ============================================
  // QUERIES
  // ============================================

  @Query(() => [AssignmentModel], { description: 'Get assignments for a lesson' })
  @UseGuards(GqlAuthGuard)
  async assignments(
    @CurrentUser() user: { id: string },
    @Args('lessonId') lessonId: string,
  ): Promise<AssignmentModel[]> {
    return this.assignmentsService.getAssignmentsByLesson(lessonId, user.id) as any;
  }

  @Query(() => AssignmentDetailModel, { description: 'Get assignment detail (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async assignmentDetail(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<AssignmentDetailModel> {
    return this.assignmentsService.getAssignmentDetail(assignmentId, user.id) as any;
  }

  @Query(() => AssignmentStudentModel, { description: 'Get assignment for student (no answers)' })
  @UseGuards(GqlAuthGuard)
  async assignmentForStudent(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<AssignmentStudentModel> {
    return this.assignmentsService.getAssignmentForStudent(assignmentId, user.id) as any;
  }

  @Query(() => SubmissionDetailModel, { nullable: true, description: 'Get my submission for an assignment' })
  @UseGuards(GqlAuthGuard)
  async mySubmission(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<SubmissionDetailModel | null> {
    return this.assignmentsService.getMySubmission(assignmentId, user.id) as any;
  }

  @Query(() => [SubmissionModel], { description: 'Get all submissions for an assignment (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async submissions(
    @CurrentUser() user: { id: string },
    @Args('assignmentId') assignmentId: string,
  ): Promise<SubmissionModel[]> {
    return this.assignmentsService.getSubmissions(assignmentId, user.id) as any;
  }

  @Query(() => SubmissionDetailModel, { description: 'Get submission detail' })
  @UseGuards(GqlAuthGuard)
  async submissionDetail(
    @CurrentUser() user: { id: string },
    @Args('submissionId') submissionId: string,
  ): Promise<SubmissionDetailModel> {
    return this.assignmentsService.getSubmissionDetail(submissionId, user.id) as any;
  }

  @Query(() => [SubmissionModel], { description: 'Get pending submissions for grading (Teacher)' })
  @UseGuards(GqlAuthGuard)
  async pendingGrading(
    @CurrentUser() user: { id: string },
  ): Promise<SubmissionModel[]> {
    return this.assignmentsService.getPendingSubmissions(user.id) as any;
  }

  @Query(() => [SubmissionModel], { description: 'Get recent graded submissions (Student)' })
  @UseGuards(GqlAuthGuard)
  async recentGrades(
    @CurrentUser() user: { id: string },
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<SubmissionModel[]> {
    return this.assignmentsService.getRecentGrades(user.id, limit) as any;
  }

  @Query(() => SubmissionContextModel, { nullable: true, description: 'Get submission context for redirect (Teacher/Student)' })
  @UseGuards(GqlAuthGuard)
  async submission(
    @CurrentUser() user: { id: string },
    @Args('id', { type: () => String }) id: string,
  ): Promise<SubmissionContextModel> {
    return this.assignmentsService.getSubmissionContext(id, user.id) as any;
  }
}
