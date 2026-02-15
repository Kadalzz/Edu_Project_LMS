import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClassroomInput,
  UpdateClassroomInput,
  EnrollStudentInput,
  UnenrollStudentInput,
} from './dto/classroom.input';

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CLASSROOM CRUD
  // ============================================

  async createClassroom(input: CreateClassroomInput, teacherId: string) {
    await this.verifyTeacher(teacherId);

    const classroom = await this.prisma.classroom.create({
      data: {
        name: input.name,
        description: input.description,
        teachers: {
          create: { teacherId },
        },
      },
      include: {
        _count: { select: { students: true, subjects: true } },
      },
    });

    return {
      ...classroom,
      studentCount: classroom._count.students,
      subjectCount: classroom._count.subjects,
    };
  }

  async updateClassroom(input: UpdateClassroomInput, teacherId: string) {
    await this.verifyTeacher(teacherId);
    await this.verifyClassroomOwnership(input.id, teacherId);

    const classroom = await this.prisma.classroom.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: { select: { students: true, subjects: true } },
      },
    });

    return {
      ...classroom,
      studentCount: classroom._count.students,
      subjectCount: classroom._count.subjects,
    };
  }

  async deleteClassroom(classroomId: string, teacherId: string) {
    await this.verifyTeacher(teacherId);
    await this.verifyClassroomOwnership(classroomId, teacherId);

    await this.prisma.classroom.delete({
      where: { id: classroomId },
    });

    return { success: true, message: 'Kelas berhasil dihapus' };
  }

  async getClassroomsByTeacher(teacherId: string) {
    const classrooms = await this.prisma.classroom.findMany({
      where: {
        teachers: { some: { teacherId } },
      },
      include: {
        _count: { select: { students: true, subjects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map((c) => ({
      ...c,
      studentCount: c._count.students,
      subjectCount: c._count.subjects,
    }));
  }

  async getClassroomDetail(classroomId: string, teacherId: string) {
    await this.verifyClassroomOwnership(classroomId, teacherId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          include: {
            student: {
              include: { user: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        subjects: {
          include: {
            _count: { select: { modules: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { students: true, subjects: true } },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return {
      ...classroom,
      studentCount: classroom._count.students,
      subjectCount: classroom._count.subjects,
      subjects: classroom.subjects.map((s) => ({
        ...s,
        moduleCount: s._count.modules,
      })),
    };
  }

  // ============================================
  // STUDENT ENROLLMENT
  // ============================================

  async enrollStudent(input: EnrollStudentInput, teacherId: string) {
    await this.verifyTeacher(teacherId);
    await this.verifyClassroomOwnership(input.classroomId, teacherId);

    // Get student profile
    const student = await this.prisma.student.findUnique({
      where: { userId: input.studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Profil siswa tidak ditemukan');
    }

    // Check if already enrolled
    const existing = await this.prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: input.classroomId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Siswa sudah terdaftar di kelas ini');
    }

    await this.prisma.classroomStudent.create({
      data: {
        classroomId: input.classroomId,
        studentId: student.id,
        userId: input.studentUserId,
      },
    });

    return { success: true, message: 'Siswa berhasil didaftarkan ke kelas' };
  }

  async unenrollStudent(input: UnenrollStudentInput, teacherId: string) {
    await this.verifyTeacher(teacherId);
    await this.verifyClassroomOwnership(input.classroomId, teacherId);

    const student = await this.prisma.student.findUnique({
      where: { userId: input.studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Profil siswa tidak ditemukan');
    }

    const enrollment = await this.prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: input.classroomId,
          studentId: student.id,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Siswa tidak terdaftar di kelas ini');
    }

    await this.prisma.classroomStudent.delete({
      where: { id: enrollment.id },
    });

    return { success: true, message: 'Siswa berhasil dikeluarkan dari kelas' };
  }

  async getAvailableStudents(classroomId: string, teacherId: string) {
    await this.verifyClassroomOwnership(classroomId, teacherId);

    // Get students NOT yet enrolled in this classroom
    const enrolledStudentIds = await this.prisma.classroomStudent.findMany({
      where: { classroomId },
      select: { studentId: true },
    });

    const excludeIds = enrolledStudentIds.map((e) => e.studentId);

    const students = await this.prisma.student.findMany({
      where: {
        id: { notIn: excludeIds },
        user: { isActive: true },
      },
      include: { user: true },
      orderBy: { user: { studentName: 'asc' } },
    });

    return students;
  }

  // ============================================
  // HELPERS
  // ============================================

  private async verifyTeacher(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang bisa mengakses fitur ini');
    }
    return user;
  }

  private async verifyClassroomOwnership(classroomId: string, teacherId: string) {
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
