import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // NOTE CRUD
  // ============================================

  async createNote(input: CreateNoteInput, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // If parent, verify this is their child
    if (user.role === 'STUDENT_PARENT' && student.userId !== userId && student.parentId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke siswa ini');
    }

    // If parent note, check teacher owns student's classroom
    if (user.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, input.studentId);
    }

    // If replying, verify parent note exists
    if (input.parentNoteId) {
      const parentNote = await this.prisma.note.findUnique({
        where: { id: input.parentNoteId },
      });

      if (!parentNote) {
        throw new NotFoundException('Catatan parent tidak ditemukan');
      }

      if (parentNote.studentId !== input.studentId) {
        throw new ForbiddenException('Catatan parent tidak sesuai dengan siswa');
      }
    }

    const note = await this.prisma.note.create({
      data: {
        content: input.content,
        studentId: input.studentId,
        writtenById: userId,
        parentNoteId: input.parentNoteId,
      },
      include: {
        writtenBy: true,
        _count: { select: { replies: true } },
      },
    });

    return this.mapNote(note);
  }

  async updateNote(input: UpdateNoteInput, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: input.noteId },
    });

    if (!note) {
      throw new NotFoundException('Catatan tidak ditemukan');
    }

    if (note.writtenById !== userId) {
      throw new ForbiddenException('Anda hanya bisa mengubah catatan sendiri');
    }

    const updated = await this.prisma.note.update({
      where: { id: input.noteId },
      data: { content: input.content },
      include: {
        writtenBy: true,
        _count: { select: { replies: true } },
      },
    });

    return this.mapNote(updated);
  }

  async deleteNote(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Catatan tidak ditemukan');
    }

    if (note.writtenById !== userId) {
      throw new ForbiddenException('Anda hanya bisa menghapus catatan sendiri');
    }

    await this.prisma.note.delete({
      where: { id: noteId },
    });

    return { success: true, message: 'Catatan berhasil dihapus' };
  }

  async getNotesByStudent(studentId: string, userId: string) {
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

    const notes = await this.prisma.note.findMany({
      where: {
        studentId,
        parentNoteId: null, // Only top-level notes
      },
      include: {
        writtenBy: true,
        replies: {
          include: {
            writtenBy: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => this.mapNoteWithReplies(note));
  }

  async getNoteDetail(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        writtenBy: true,
        student: {
          include: { user: true },
        },
        replies: {
          include: {
            writtenBy: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { replies: true } },
      },
    });

    if (!note) {
      throw new NotFoundException('Catatan tidak ditemukan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Verify access
    if (user?.role === 'TEACHER') {
      await this.verifyTeacherHasStudent(userId, note.studentId);
    } else if (user?.role === 'STUDENT_PARENT') {
      if (note.student.userId !== userId && note.student.parentId !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses ke catatan ini');
      }
    }

    return this.mapNoteWithReplies(note);
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapNote(note: any) {
    return {
      ...note,
      writtenBy: {
        id: note.writtenBy.id,
        name: note.writtenBy.teacherName || note.writtenBy.studentName || note.writtenBy.parentName || 'Unknown',
        role: note.writtenBy.role,
      },
      replyCount: note._count?.replies || 0,
    };
  }

  private mapNoteWithReplies(note: any) {
    return {
      ...note,
      writtenBy: {
        id: note.writtenBy.id,
        name: note.writtenBy.teacherName || note.writtenBy.studentName || note.writtenBy.parentName || 'Unknown',
        role: note.writtenBy.role,
      },
      replies: note.replies?.map((reply: any) => this.mapNote(reply)) || [],
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
