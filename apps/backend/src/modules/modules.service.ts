import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleInput, UpdateModuleInput } from './dto/module.input';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // MODULE CRUD
  // ============================================

  async createModule(input: CreateModuleInput, teacherId: string) {
    await this.verifyTeacherOwnsSubject(input.subjectId, teacherId);

    // Auto-set order if not provided
    let order = input.order;
    if (order === undefined || order === null) {
      const maxOrder = await this.prisma.module.findFirst({
        where: { subjectId: input.subjectId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const mod = await this.prisma.module.create({
      data: {
        name: input.name,
        description: input.description,
        subjectId: input.subjectId,
        order,
      },
      include: {
        _count: { select: { lessons: true } },
      },
    });

    return {
      ...mod,
      lessonCount: mod._count.lessons,
    };
  }

  async updateModule(input: UpdateModuleInput, teacherId: string) {
    const mod = await this.prisma.module.findUnique({
      where: { id: input.id },
    });
    if (!mod) {
      throw new NotFoundException('Modul tidak ditemukan');
    }

    await this.verifyTeacherOwnsSubject(mod.subjectId, teacherId);

    const updated = await this.prisma.module.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: { select: { lessons: true } },
      },
    });

    return {
      ...updated,
      lessonCount: updated._count.lessons,
    };
  }

  async deleteModule(moduleId: string, teacherId: string) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw new NotFoundException('Modul tidak ditemukan');
    }

    await this.verifyTeacherOwnsSubject(mod.subjectId, teacherId);

    await this.prisma.module.delete({
      where: { id: moduleId },
    });

    return { success: true, message: 'Modul berhasil dihapus' };
  }

  async getModulesBySubject(subjectId: string, teacherId: string) {
    await this.verifyTeacherOwnsSubject(subjectId, teacherId);

    const modules = await this.prisma.module.findMany({
      where: { subjectId },
      include: {
        _count: { select: { lessons: true } },
      },
      orderBy: { order: 'asc' },
    });

    return modules.map((m) => ({
      ...m,
      lessonCount: m._count.lessons,
    }));
  }

  async getModuleDetail(moduleId: string, teacherId: string) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          include: {
            _count: { select: { media: true, assignments: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { lessons: true } },
      },
    });

    if (!mod) {
      throw new NotFoundException('Modul tidak ditemukan');
    }

    await this.verifyTeacherOwnsSubject(mod.subjectId, teacherId);

    return {
      ...mod,
      lessonCount: mod._count.lessons,
      lessons: mod.lessons.map((l) => ({
        ...l,
        mediaCount: l._count.media,
        assignmentCount: l._count.assignments,
      })),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async verifyTeacherOwnsSubject(subjectId: string, teacherId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang dapat mengakses fitur ini');
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      select: { classroomId: true },
    });
    if (!subject) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    const isTeacher = await this.prisma.classroomTeacher.findUnique({
      where: {
        classroomId_teacherId: {
          classroomId: subject.classroomId,
          teacherId,
        },
      },
    });
    if (!isTeacher) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }
  }
}
