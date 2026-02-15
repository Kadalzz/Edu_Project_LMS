import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectInput, UpdateSubjectInput } from './dto/subject.input';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubject(input: CreateSubjectInput, teacherId: string) {
    await this.verifyTeacherOwnsClassroom(input.classroomId, teacherId);

    // Auto-set order if not provided
    let order = input.order;
    if (order === undefined || order === null) {
      const maxOrder = await this.prisma.subject.findFirst({
        where: { classroomId: input.classroomId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const subject = await this.prisma.subject.create({
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        classroomId: input.classroomId,
        order,
      },
      include: {
        _count: { select: { modules: true } },
      },
    });

    return {
      ...subject,
      moduleCount: subject._count.modules,
    };
  }

  async updateSubject(input: UpdateSubjectInput, teacherId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: input.id },
    });
    if (!subject) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    await this.verifyTeacherOwnsClassroom(subject.classroomId, teacherId);

    const updated = await this.prisma.subject.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: { select: { modules: true } },
      },
    });

    return {
      ...updated,
      moduleCount: updated._count.modules,
    };
  }

  async deleteSubject(subjectId: string, teacherId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    await this.verifyTeacherOwnsClassroom(subject.classroomId, teacherId);

    await this.prisma.subject.delete({
      where: { id: subjectId },
    });

    return { success: true, message: 'Mata pelajaran berhasil dihapus' };
  }

  async getSubjectsByClassroom(classroomId: string, teacherId: string) {
    await this.verifyTeacherOwnsClassroom(classroomId, teacherId);

    const subjects = await this.prisma.subject.findMany({
      where: { classroomId },
      include: {
        _count: { select: { modules: true } },
      },
      orderBy: { order: 'asc' },
    });

    return subjects.map((s) => ({
      ...s,
      moduleCount: s._count.modules,
    }));
  }

  async getSubjectDetail(subjectId: string, teacherId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { modules: true } },
      },
    });

    if (!subject) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    await this.verifyTeacherOwnsClassroom(subject.classroomId, teacherId);

    return {
      ...subject,
      moduleCount: subject._count.modules,
      modules: subject.modules.map((m) => ({
        ...m,
        lessonCount: m._count.lessons,
      })),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async verifyTeacherOwnsClassroom(classroomId: string, teacherId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang bisa mengakses fitur ini');
    }

    const relation = await this.prisma.classroomTeacher.findUnique({
      where: {
        classroomId_teacherId: {
          classroomId,
          teacherId,
        },
      },
    });
    if (!relation) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }
  }
}
