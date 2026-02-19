import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly XP_PER_LEVEL = 100;

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  async markLessonComplete(lessonId: string, studentId: string) {
    // Check if progress already exists
    const existing = await this.prisma.progress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
    });

    if (existing) {
      if (existing.completed) {
        return existing; // Already completed
      }
      // Mark as completed
      return this.prisma.progress.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // Get lesson to find subject
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    // Create new progress record
    return this.prisma.progress.create({
      data: {
        studentId,
        subjectId: lesson.module.subject.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  async getStudentStats(studentId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classrooms: {
          include: {
            classroom: {
              include: {
                subjects: {
                  where: { isActive: true },
                  include: {
                    modules: {
                      where: { isActive: true },
                      include: {
                        lessons: {
                          where: { isActive: true, isDraft: false },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        submissions: {
          where: {
            status: 'GRADED',
          },
          include: {
            assignment: true,
          },
        },
        progress: {
          where: { completed: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // Verify access
    if (user.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, studentId);
    } else if (user.role === 'STUDENT_PARENT') {
      if (student.userId !== userId && student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke siswa ini');
      }
    }

    // Calculate level progress
    const xpToNextLevel = this.XP_PER_LEVEL;
    const levelProgress = (student.currentXP / xpToNextLevel) * 100;

    // Calculate assignment stats
    const totalAssignmentsCompleted = student.submissions.length;
    const totalQuizzesCompleted = student.submissions.filter(
      (s) => s.assignment.type === 'QUIZ',
    ).length;
    const totalTasksCompleted = student.submissions.filter(
      (s) => s.assignment.type === 'TASK_ANALYSIS',
    ).length;

    // Calculate average score
    const scores = student.submissions
      .filter((s) => s.score !== null)
      .map((s) => s.score as number);
    const averageScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

    // Calculate subject progress
    const subjectProgress = [];
    for (const enrollment of student.classrooms) {
      for (const subject of enrollment.classroom.subjects) {
        const totalLessons = subject.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0,
        );

        const completedLessons = student.progress.filter((p) =>
          subject.modules.some((m) =>
            m.lessons.some((l) => l.id === p.lessonId),
          ),
        ).length;

        const completionPercentage =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        subjectProgress.push({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          subjectColor: subject.color,
          totalLessons,
          completedLessons,
          completionPercentage: Math.round(completionPercentage * 10) / 10,
        });
      }
    }

    return {
      studentId: student.id,
      studentName: student.user.studentName || 'Unknown',
      level: student.level,
      totalXP: student.totalXP,
      currentXP: student.currentXP,
      xpToNextLevel,
      levelProgress: Math.round(levelProgress * 10) / 10,
      totalAssignmentsCompleted,
      totalQuizzesCompleted,
      totalTasksCompleted,
      averageScore: Math.round(averageScore * 10) / 10,
      subjectProgress,
    };
  }

  async getLevelInfo(studentId: string, userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // Verify access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, studentId);
    } else if (user.role === 'STUDENT_PARENT') {
      if (student.userId !== userId && student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke siswa ini');
      }
    }

    const xpToNextLevel = this.XP_PER_LEVEL;
    const progressPercentage = (student.currentXP / xpToNextLevel) * 100;

    return {
      currentLevel: student.level,
      currentXP: student.currentXP,
      totalXP: student.totalXP,
      xpToNextLevel,
      progressPercentage: Math.round(progressPercentage * 10) / 10,
    };
  }

  async getSubjectProgress(studentId: string, subjectId: string, userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // Verify access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, studentId);
    } else if (user.role === 'STUDENT_PARENT') {
      if (student.userId !== userId && student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke siswa ini');
      }
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        modules: {
          where: { isActive: true },
          include: {
            lessons: {
              where: { isActive: true, isDraft: false },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject tidak ditemukan');
    }

    const totalLessons = subject.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );

    const progress = await this.prisma.progress.findMany({
      where: {
        studentId,
        subjectId,
        completed: true,
      },
    });

    const completedLessons = progress.length;
    const completionPercentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectIcon: subject.icon,
      subjectColor: subject.color,
      totalLessons,
      completedLessons,
      completionPercentage: Math.round(completionPercentage * 10) / 10,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async verifyTeacherHasStudent(teacherId: string, studentId: string) {
    const enrollment = await this.prisma.classroomStudent.findFirst({
      where: {
        studentId,
        classroom: {
          teachers: {
            some: {
              teacherId,
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Anda tidak memiliki akses ke siswa ini');
    }
  }
}
