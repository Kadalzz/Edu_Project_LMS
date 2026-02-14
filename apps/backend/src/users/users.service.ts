import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentInput, UpdateProfileInput } from './dto/user.input';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        children: {
          include: { user: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async createStudent(input: CreateStudentInput, teacherId: string) {
    // Verify teacher role
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang bisa membuat akun siswa');
    }

    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Verify classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: input.classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user + student profile + enrollment in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash: hashedPassword,
          role: 'STUDENT_PARENT',
          studentName: input.studentName,
          parentName: input.parentName,
          isActive: true,
          isVerified: true,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          parentId: user.id,
          level: 1,
          totalXP: 0,
          currentXP: 0,
        },
      });

      // Enroll student in classroom
      await tx.classroomStudent.create({
        data: {
          classroomId: input.classroomId,
          studentId: student.id,
          userId: user.id,
        },
      });

      return { ...user, studentProfile: student };
    });

    return result;
  }

  async getStudentsByTeacher(teacherId: string) {
    // Get classrooms where teacher teaches
    const teacherClassrooms = await this.prisma.classroomTeacher.findMany({
      where: { teacherId },
      select: { classroomId: true },
    });

    const classroomIds = teacherClassrooms.map((tc) => tc.classroomId);

    // Get all students enrolled in those classrooms
    const enrollments = await this.prisma.classroomStudent.findMany({
      where: { classroomId: { in: classroomIds } },
      include: {
        student: {
          include: { user: true },
        },
        classroom: true,
      },
    });

    return enrollments.map((e) => ({
      ...e.student,
      user: e.student.user,
      classroom: e.classroom,
    }));
  }

  async getClassrooms(teacherId: string) {
    const classrooms = await this.prisma.classroom.findMany({
      where: {
        teachers: { some: { teacherId } },
      },
      include: {
        students: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
        _count: {
          select: { students: true, subjects: true },
        },
      },
    });

    return classrooms;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.studentName && { studentName: input.studentName }),
        ...(input.parentName && { parentName: input.parentName }),
        ...(input.teacherName && { teacherName: input.teacherName }),
        ...(input.avatar && { avatar: input.avatar }),
      },
    });

    return user;
  }

  async toggleStudentActive(studentUserId: string, teacherId: string) {
    // Verify teacher
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new ForbiddenException('Hanya guru yang bisa mengubah status siswa');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: studentUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id: studentUserId },
      data: { isActive: !targetUser.isActive },
    });
  }
}
