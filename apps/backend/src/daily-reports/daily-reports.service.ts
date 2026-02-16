import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyReportInput, UpdateDailyReportInput, AddCommentInput } from './dto/daily-report.input';

@Injectable()
export class DailyReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // DAILY REPORT CRUD
  // ============================================

  async createDailyReport(input: CreateDailyReportInput, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang dapat membuat laporan harian');
    }

    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // Verify teacher has this student
    await this.verifyTeacherHasStudent(userId, input.studentId);

    // Check if report already exists for this date
    const existingReport = await this.prisma.dailyReport.findUnique({
      where: {
        studentId_date: {
          studentId: input.studentId,
          date: new Date(input.date),
        },
      },
    });

    if (existingReport) {
      throw new ConflictException('Laporan untuk tanggal ini sudah ada');
    }

    const report = await this.prisma.dailyReport.create({
      data: {
        studentId: input.studentId,
        createdById: userId,
        date: new Date(input.date),
        mood: input.mood,
        activities: input.activities,
        achievements: input.achievements,
        challenges: input.challenges,
        notes: input.notes,
      },
      include: {
        createdBy: true,
        comments: {
          include: { commentedBy: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.mapDailyReport(report);
  }

  async updateDailyReport(input: UpdateDailyReportInput, userId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: input.reportId },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (report.createdById !== userId) {
      throw new ForbiddenException('Anda hanya bisa mengubah laporan sendiri');
    }

    const updated = await this.prisma.dailyReport.update({
      where: { id: input.reportId },
      data: {
        ...(input.mood !== undefined && { mood: input.mood }),
        ...(input.activities !== undefined && { activities: input.activities }),
        ...(input.achievements !== undefined && { achievements: input.achievements }),
        ...(input.challenges !== undefined && { challenges: input.challenges }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
      include: {
        createdBy: true,
        comments: {
          include: { commentedBy: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.mapDailyReport(updated);
  }

  async deleteDailyReport(reportId: string, userId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (report.createdById !== userId) {
      throw new ForbiddenException('Anda hanya bisa menghapus laporan sendiri');
    }

    await this.prisma.dailyReport.delete({
      where: { id: reportId },
    });

    return { success: true, message: 'Laporan berhasil dihapus' };
  }

  async getDailyReportsByStudent(studentId: string, userId: string, startDate?: string, endDate?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
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

    const where: any = { studentId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const reports = await this.prisma.dailyReport.findMany({
      where,
      include: {
        createdBy: true,
        comments: {
          include: { commentedBy: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    return reports.map((report) => this.mapDailyReport(report));
  }

  async getDailyReportDetail(reportId: string, userId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        createdBy: true,
        student: {
          include: { user: true },
        },
        comments: {
          include: { commentedBy: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Verify access
    if (user?.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, report.studentId);
    } else if (user?.role === 'STUDENT_PARENT') {
      if (report.student.userId !== userId && report.student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke laporan ini');
      }
    }

    return this.mapDailyReport(report);
  }

  async addComment(input: AddCommentInput, userId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: input.reportId },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Verify access
    if (user?.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, report.studentId);
    } else if (user?.role === 'STUDENT_PARENT') {
      if (report.student.userId !== userId && report.student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke laporan ini');
      }
    }

    const comment = await this.prisma.dailyReportComment.create({
      data: {
        content: input.content,
        dailyReportId: input.reportId,
        commentedById: userId,
      },
      include: {
        commentedBy: true,
      },
    });

    return {
      ...comment,
      commentedBy: {
        id: comment.commentedBy.id,
        name: comment.commentedBy.teacherName || comment.commentedBy.studentName || comment.commentedBy.parentName || 'Unknown',
        role: comment.commentedBy.role,
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapDailyReport(report: any) {
    return {
      ...report,
      createdBy: {
        id: report.createdBy.id,
        name: report.createdBy.teacherName || report.createdBy.studentName || report.createdBy.parentName || 'Unknown',
        role: report.createdBy.role,
      },
      comments: report.comments?.map((comment: any) => ({
        ...comment,
        commentedBy: {
          id: comment.commentedBy.id,
          name: comment.commentedBy.teacherName || comment.commentedBy.studentName || comment.commentedBy.parentName || 'Unknown',
          role: comment.commentedBy.role,
        },
      })) || [],
    };
  }

  private async verifyTeacherHasStudent(teacherId: string, studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang dapat mengakses fitur ini');
    }

    // Check if student is in any classroom taught by this teacher
    const enrollment = await this.prisma.classroomStudent.findFirst({
      where: {
        studentId,
        classroom: {
          teachers: {
            some: { teacherId },
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Siswa tidak ada di kelas Anda');
    }
  }
}
