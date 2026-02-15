import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonInput, UpdateLessonInput } from './dto/lesson.input';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // LESSON CRUD
  // ============================================

  async createLesson(input: CreateLessonInput, teacherId: string) {
    await this.verifyTeacherOwnsModule(input.moduleId, teacherId);

    // Auto-set order if not provided
    let order = input.order;
    if (order === undefined || order === null) {
      const maxOrder = await this.prisma.lesson.findFirst({
        where: { moduleId: input.moduleId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        moduleId: input.moduleId,
        createdById: teacherId,
        order,
        isDraft: input.isDraft ?? true,
      },
      include: {
        _count: { select: { media: true, assignments: true } },
      },
    });

    return {
      ...lesson,
      mediaCount: lesson._count.media,
      assignmentCount: lesson._count.assignments,
    };
  }

  async updateLesson(input: UpdateLessonInput, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: input.id },
    });
    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    await this.verifyTeacherOwnsModule(lesson.moduleId, teacherId);

    const updated = await this.prisma.lesson.update({
      where: { id: input.id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.isDraft !== undefined && { isDraft: input.isDraft }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: { select: { media: true, assignments: true } },
      },
    });

    return {
      ...updated,
      mediaCount: updated._count.media,
      assignmentCount: updated._count.assignments,
    };
  }

  async deleteLesson(lessonId: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    await this.verifyTeacherOwnsModule(lesson.moduleId, teacherId);

    await this.prisma.lesson.delete({
      where: { id: lessonId },
    });

    return { success: true, message: 'Materi berhasil dihapus' };
  }

  async getLessonsByModule(moduleId: string, teacherId: string) {
    await this.verifyTeacherOwnsModule(moduleId, teacherId);

    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      include: {
        _count: { select: { media: true, assignments: true } },
      },
      orderBy: { order: 'asc' },
    });

    return lessons.map((l) => ({
      ...l,
      mediaCount: l._count.media,
      assignmentCount: l._count.assignments,
    }));
  }

  async getLessonDetail(lessonId: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        media: {
          include: { media: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { media: true, assignments: true } },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    await this.verifyTeacherOwnsModule(lesson.moduleId, teacherId);

    return {
      ...lesson,
      mediaCount: lesson._count.media,
      assignmentCount: lesson._count.assignments,
    };
  }

  // ============================================
  // PUBLISH / UNPUBLISH
  // ============================================

  async toggleDraft(lessonId: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    await this.verifyTeacherOwnsModule(lesson.moduleId, teacherId);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { isDraft: !lesson.isDraft },
      include: {
        _count: { select: { media: true, assignments: true } },
      },
    });

    const statusMsg = updated.isDraft ? 'kembali ke draft' : 'dipublikasikan';
    return {
      ...updated,
      mediaCount: updated._count.media,
      assignmentCount: updated._count.assignments,
      _message: `Materi berhasil ${statusMsg}`,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async verifyTeacherOwnsModule(moduleId: string, teacherId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang dapat mengakses fitur ini');
    }

    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { subject: { select: { classroomId: true } } },
    });
    if (!mod) {
      throw new NotFoundException('Modul tidak ditemukan');
    }

    const isTeacher = await this.prisma.classroomTeacher.findUnique({
      where: {
        classroomId_teacherId: {
          classroomId: mod.subject.classroomId,
          teacherId,
        },
      },
    });
    if (!isTeacher) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }
  }
}
