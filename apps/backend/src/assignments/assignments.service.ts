import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // ASSIGNMENT CRUD (Teacher)
  // ============================================

  async createAssignment(input: CreateAssignmentInput, teacherId: string) {
    await this.verifyTeacherOwnsLesson(input.lessonId, teacherId);

    const assignment = await this.prisma.assignment.create({
      data: {
        title: input.title,
        description: input.description,
        type: input.type as any,
        lessonId: input.lessonId,
        createdById: teacherId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        xpReward: input.xpReward ?? 10,
        isDraft: input.isDraft ?? true,
      },
      include: {
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
            submissions: true,
          },
        },
      },
    });

    return this.mapAssignment(assignment);
  }

  async updateAssignment(input: UpdateAssignmentInput, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.id },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    const updated = await this.prisma.assignment.update({
      where: { id: input.id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
        ...(input.xpReward !== undefined && { xpReward: input.xpReward }),
        ...(input.isDraft !== undefined && { isDraft: input.isDraft }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
            submissions: true,
          },
        },
      },
    });

    return this.mapAssignment(updated);
  }

  async deleteAssignment(assignmentId: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    await this.prisma.assignment.delete({ where: { id: assignmentId } });

    return { success: true, message: 'Tugas berhasil dihapus' };
  }

  async toggleAssignmentDraft(assignmentId: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    const updated = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { isDraft: !assignment.isDraft },
      include: {
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
            submissions: true,
          },
        },
      },
    });

    return this.mapAssignment(updated);
  }

  async getAssignmentsByLesson(lessonId: string, userId: string) {
    // Verify user has access
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User tidak ditemukan');

    const assignments = await this.prisma.assignment.findMany({
      where: {
        lessonId,
        ...(user.role !== 'TEACHER' && { isDraft: false, isActive: true }),
      },
      include: {
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return assignments.map((a) => this.mapAssignment(a));
  }

  async getAssignmentDetail(assignmentId: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        quizQuestions: {
          include: { options: { orderBy: { optionKey: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        taskSteps: {
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    return {
      ...assignment,
      questionCount: assignment._count.quizQuestions + assignment._count.taskSteps,
      submissionCount: assignment._count.submissions,
    };
  }

  // Student view - no correct answers exposed
  async getAssignmentForStudent(assignmentId: string, studentUserId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId, isDraft: false, isActive: true },
      include: {
        quizQuestions: {
          include: {
            options: {
              select: {
                id: true,
                optionKey: true,
                text: true,
                image: true,
                // isCorrect NOT selected
              },
              orderBy: { optionKey: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        taskSteps: {
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: {
            quizQuestions: true,
            taskSteps: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    return {
      ...assignment,
      questionCount: assignment._count.quizQuestions + assignment._count.taskSteps,
    };
  }

  // ============================================
  // QUIZ QUESTIONS (Teacher)
  // ============================================

  async addQuizQuestion(input: AddQuizQuestionInput, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }
    if (assignment.type !== 'QUIZ') {
      throw new BadRequestException('Tugas ini bukan tipe Quiz');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    // Validate options: exactly one correct answer
    const correctCount = input.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Harus ada tepat 1 jawaban benar');
    }

    // Auto-set order
    let order = input.order;
    if (order === undefined || order === null) {
      const maxOrder = await this.prisma.quizQuestion.findFirst({
        where: { assignmentId: input.assignmentId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const question = await this.prisma.quizQuestion.create({
      data: {
        question: input.question,
        questionImage: input.questionImage,
        order,
        assignmentId: input.assignmentId,
        options: {
          create: input.options.map((o) => ({
            optionKey: o.optionKey,
            text: o.text,
            image: o.image,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: {
        options: { orderBy: { optionKey: 'asc' } },
      },
    });

    return question;
  }

  async updateQuizQuestion(input: UpdateQuizQuestionInput, teacherId: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: input.id },
      include: { assignment: true },
    });
    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(question.assignment.lessonId, teacherId);

    // If options provided, validate and replace
    if (input.options) {
      const correctCount = input.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException('Harus ada tepat 1 jawaban benar');
      }

      // Delete old options and create new ones
      await this.prisma.quizOption.deleteMany({
        where: { questionId: input.id },
      });

      await this.prisma.quizOption.createMany({
        data: input.options.map((o) => ({
          questionId: input.id,
          optionKey: o.optionKey,
          text: o.text,
          image: o.image,
          isCorrect: o.isCorrect,
        })),
      });
    }

    const updated = await this.prisma.quizQuestion.update({
      where: { id: input.id },
      data: {
        ...(input.question !== undefined && { question: input.question }),
        ...(input.questionImage !== undefined && { questionImage: input.questionImage }),
        ...(input.order !== undefined && { order: input.order }),
      },
      include: {
        options: { orderBy: { optionKey: 'asc' } },
      },
    });

    return updated;
  }

  async deleteQuizQuestion(questionId: string, teacherId: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { assignment: true },
    });
    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(question.assignment.lessonId, teacherId);

    await this.prisma.quizQuestion.delete({ where: { id: questionId } });

    return { success: true, message: 'Pertanyaan berhasil dihapus' };
  }

  // ============================================
  // TASK STEPS (Teacher)
  // ============================================

  async addTaskStep(input: AddTaskStepInput, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }
    if (assignment.type !== 'TASK_ANALYSIS') {
      throw new BadRequestException('Tugas ini bukan tipe Task Analysis');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    const step = await this.prisma.taskStep.create({
      data: {
        stepNumber: input.stepNumber,
        instruction: input.instruction,
        referenceImage: input.referenceImage,
        isMandatory: input.isMandatory ?? true,
        assignmentId: input.assignmentId,
      },
    });

    return step;
  }

  async updateTaskStep(input: UpdateTaskStepInput, teacherId: string) {
    const step = await this.prisma.taskStep.findUnique({
      where: { id: input.id },
      include: { assignment: true },
    });
    if (!step) {
      throw new NotFoundException('Langkah tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(step.assignment.lessonId, teacherId);

    const updated = await this.prisma.taskStep.update({
      where: { id: input.id },
      data: {
        ...(input.stepNumber !== undefined && { stepNumber: input.stepNumber }),
        ...(input.instruction !== undefined && { instruction: input.instruction }),
        ...(input.referenceImage !== undefined && { referenceImage: input.referenceImage }),
        ...(input.isMandatory !== undefined && { isMandatory: input.isMandatory }),
      },
    });

    return updated;
  }

  async deleteTaskStep(stepId: string, teacherId: string) {
    const step = await this.prisma.taskStep.findUnique({
      where: { id: stepId },
      include: { assignment: true },
    });
    if (!step) {
      throw new NotFoundException('Langkah tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(step.assignment.lessonId, teacherId);

    await this.prisma.taskStep.delete({ where: { id: stepId } });

    return { success: true, message: 'Langkah berhasil dihapus' };
  }

  // ============================================
  // SUBMISSIONS (Student)
  // ============================================

  async startSubmission(assignmentId: string, studentUserId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId, isDraft: false, isActive: true },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan atau belum dipublikasikan');
    }

    // Get student profile
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      throw new ForbiddenException('Profil siswa tidak ditemukan');
    }

    // Check if already submitted
    const existing = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      if (existing.status === 'SUBMITTED' || existing.status === 'GRADED') {
        throw new BadRequestException('Anda sudah mengumpulkan tugas ini');
      }
      // Return existing draft
      return existing;
    }

    // Create new draft submission
    const submission = await this.prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        status: 'DRAFT',
      },
    });

    return submission;
  }

  async submitQuizAnswer(input: SubmitQuizAnswerInput, studentUserId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: input.submissionId },
      include: { assignment: true },
    });
    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    await this.verifyStudentOwnsSubmission(submission, studentUserId);

    if (submission.status !== 'DRAFT') {
      throw new BadRequestException('Submission sudah dikumpulkan');
    }

    // Get correct answer
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: input.questionId },
      include: { options: true },
    });
    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    const correctOption = question.options.find((o) => o.isCorrect);
    const isCorrect = correctOption?.optionKey === input.selectedOption;

    // Upsert answer (allow changing answer before submit)
    const answer = await this.prisma.quizAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId: input.submissionId,
          questionId: input.questionId,
        },
      },
      create: {
        submissionId: input.submissionId,
        questionId: input.questionId,
        selectedOption: input.selectedOption,
        isCorrect,
      },
      update: {
        selectedOption: input.selectedOption,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    return answer;
  }

  async completeQuizSubmission(submissionId: string, studentUserId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { quizQuestions: true },
        },
        quizAnswers: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    await this.verifyStudentOwnsSubmission(submission, studentUserId);

    if (submission.status !== 'DRAFT') {
      throw new BadRequestException('Submission sudah dikumpulkan');
    }

    // Auto-grade quiz
    const totalQuestions = submission.assignment.quizQuestions.length;
    const correctCount = submission.quizAnswers.filter((a) => a.isCorrect).length;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Update submission
    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'GRADED',
        score,
        submittedAt: new Date(),
        gradedAt: new Date(),
      },
    });

    // Auto-create grading record
    await this.prisma.grading.create({
      data: {
        submissionId,
        gradedById: submission.assignment.createdById, // System grading attributed to teacher
        score,
        feedback: `Otomatis dinilai: ${correctCount}/${totalQuestions} jawaban benar`,
      },
    });

    // Award XP
    if (score >= 60) {
      await this.awardXP(submission.studentId, submission.assignment.xpReward);
    }

    return {
      score,
      correctCount,
      totalQuestions,
      xpEarned: score >= 60 ? submission.assignment.xpReward : 0,
      submissionId,
    };
  }

  async submitTaskStep(input: SubmitTaskStepInput, studentUserId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: input.submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    await this.verifyStudentOwnsSubmission(submission, studentUserId);

    if (submission.status === 'GRADED') {
      throw new BadRequestException('Submission sudah dinilai');
    }

    // Verify step belongs to the same assignment
    const step = await this.prisma.taskStep.findUnique({
      where: { id: input.stepId },
    });
    if (!step || step.assignmentId !== submission.assignmentId) {
      throw new BadRequestException('Langkah tidak valid untuk tugas ini');
    }

    // Upsert step submission
    const stepSubmission = await this.prisma.stepSubmission.upsert({
      where: {
        submissionId_stepId: {
          submissionId: input.submissionId,
          stepId: input.stepId,
        },
      },
      create: {
        submissionId: input.submissionId,
        stepId: input.stepId,
        photoUrl: input.photoUrl,
        videoUrl: input.videoUrl,
        status: 'PENDING',
      },
      update: {
        photoUrl: input.photoUrl,
        videoUrl: input.videoUrl,
        status: 'PENDING',
        submittedAt: new Date(),
      },
      include: { step: true },
    });

    return stepSubmission;
  }

  async completeTaskSubmission(submissionId: string, studentUserId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { include: { taskSteps: true } },
        stepSubmissions: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    await this.verifyStudentOwnsSubmission(submission, studentUserId);

    if (submission.status !== 'DRAFT') {
      throw new BadRequestException('Submission sudah dikumpulkan');
    }

    // Check all mandatory steps are submitted
    const mandatorySteps = submission.assignment.taskSteps.filter((s) => s.isMandatory);
    const submittedStepIds = submission.stepSubmissions.map((s) => s.stepId);
    const missingSteps = mandatorySteps.filter((s) => !submittedStepIds.includes(s.id));

    if (missingSteps.length > 0) {
      throw new BadRequestException(
        `Langkah wajib belum lengkap: ${missingSteps.map((s) => `Langkah ${s.stepNumber}`).join(', ')}`,
      );
    }

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return updated;
  }

  // ============================================
  // GRADING (Teacher)
  // ============================================

  async gradeSubmission(input: GradeSubmissionInput, teacherId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: input.submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(submission.assignment.lessonId, teacherId);

    if (submission.status === 'DRAFT') {
      throw new BadRequestException('Siswa belum mengumpulkan tugas');
    }

    // Upsert grading
    const grading = await this.prisma.grading.upsert({
      where: { submissionId: input.submissionId },
      create: {
        submissionId: input.submissionId,
        gradedById: teacherId,
        score: input.score,
        feedback: input.feedback,
      },
      update: {
        gradedById: teacherId,
        score: input.score,
        feedback: input.feedback,
        gradedAt: new Date(),
      },
    });

    // Update submission status & score
    await this.prisma.submission.update({
      where: { id: input.submissionId },
      data: {
        status: 'GRADED',
        score: input.score,
        gradedAt: new Date(),
      },
    });

    // Award XP if score >= 60
    if (input.score >= 60) {
      await this.awardXP(submission.studentId, submission.assignment.xpReward);
    }

    return grading;
  }

  async reviewTaskStep(input: ReviewTaskStepInput, teacherId: string) {
    const stepSubmission = await this.prisma.stepSubmission.findUnique({
      where: { id: input.stepSubmissionId },
      include: {
        submission: { include: { assignment: true } },
      },
    });

    if (!stepSubmission) {
      throw new NotFoundException('Step submission tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(
      stepSubmission.submission.assignment.lessonId,
      teacherId,
    );

    const updated = await this.prisma.stepSubmission.update({
      where: { id: input.stepSubmissionId },
      data: {
        status: input.status as any,
        comment: input.comment,
        reviewedAt: new Date(),
      },
      include: { step: true },
    });

    return updated;
  }

  // ============================================
  // SUBMISSION QUERIES
  // ============================================

  async getMySubmission(assignmentId: string, studentUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) return null;

    const submission = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
      include: {
        quizAnswers: true,
        stepSubmissions: {
          include: { step: true },
          orderBy: { step: { stepNumber: 'asc' } },
        },
        grading: true,
        student: {
          include: {
            user: { select: { id: true, studentName: true } },
          },
        },
        assignment: {
          include: {
            _count: {
              select: { quizQuestions: true, taskSteps: true, submissions: true },
            },
          },
        },
      },
    });

    if (!submission) return null;

    return this.mapSubmissionDetail(submission);
  }

  async getSubmissions(assignmentId: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }

    await this.verifyTeacherOwnsLesson(assignment.lessonId, teacherId);

    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, studentName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((s) => ({
      ...s,
      student: {
        id: s.student.id,
        userId: s.student.userId,
        level: s.student.level,
        totalXP: s.student.totalXP,
        studentName: s.student.user.studentName,
      },
    }));
  }

  async getSubmissionDetail(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        quizAnswers: {
          include: {
            question: {
              include: { options: { orderBy: { optionKey: 'asc' } } },
            },
          },
          orderBy: { question: { order: 'asc' } },
        },
        stepSubmissions: {
          include: { step: true },
          orderBy: { step: { stepNumber: 'asc' } },
        },
        grading: true,
        student: {
          include: {
            user: { select: { id: true, studentName: true } },
          },
        },
        assignment: {
          include: {
            _count: {
              select: { quizQuestions: true, taskSteps: true, submissions: true },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan');
    }

    // Verify access (teacher or the student themselves)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'TEACHER') {
      await this.verifyTeacherOwnsLesson(submission.assignment.lessonId, userId);
    } else {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });
      if (!student || student.id !== submission.studentId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke submission ini');
      }
    }

    return this.mapSubmissionDetail(submission);
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapAssignment(assignment: any) {
    const questionCount =
      (assignment._count?.quizQuestions || 0) +
      (assignment._count?.taskSteps || 0);
    return {
      ...assignment,
      questionCount,
      submissionCount: assignment._count?.submissions || 0,
    };
  }

  private mapSubmissionDetail(submission: any) {
    return {
      ...submission,
      student: submission.student
        ? {
            id: submission.student.id,
            userId: submission.student.userId,
            level: submission.student.level,
            totalXP: submission.student.totalXP,
            studentName: submission.student.user?.studentName,
          }
        : undefined,
      assignment: submission.assignment
        ? {
            ...submission.assignment,
            questionCount:
              (submission.assignment._count?.quizQuestions || 0) +
              (submission.assignment._count?.taskSteps || 0),
            submissionCount: submission.assignment._count?.submissions || 0,
          }
        : undefined,
    };
  }

  private async awardXP(studentId: string, xp: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) return;

    let currentXP = student.currentXP + xp;
    let level = student.level;
    const xpPerLevel = 100; // 100 XP per level

    while (currentXP >= xpPerLevel) {
      currentXP -= xpPerLevel;
      level++;
    }

    await this.prisma.student.update({
      where: { id: studentId },
      data: {
        totalXP: student.totalXP + xp,
        currentXP,
        level,
      },
    });
  }

  private async verifyTeacherOwnsLesson(lessonId: string, teacherId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang dapat mengakses fitur ini');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { subject: { select: { classroomId: true } } },
        },
      },
    });
    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    const isTeacher = await this.prisma.classroomTeacher.findUnique({
      where: {
        classroomId_teacherId: {
          classroomId: lesson.module.subject.classroomId,
          teacherId,
        },
      },
    });
    if (!isTeacher) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }
  }

  private async verifyStudentOwnsSubmission(submission: any, studentUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student || student.id !== submission.studentId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke submission ini');
    }
  }
}
