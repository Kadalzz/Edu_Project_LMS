'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  CLASSROOM_QUERIES,
  CLASSROOM_MUTATIONS,
  SUBJECT_MUTATIONS,
  SUBJECT_QUERIES,
} from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  UserPlus,
  UserMinus,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// ICON OPTIONS for Subjects
// ============================================
const SUBJECT_ICONS = ['📚', '🔢', '🔬', '🎨', '🌍', '📖', '🎵', '⚽', '💻', '🧠', '✏️', '🗣️'];
const SUBJECT_COLORS = [
  { label: 'Biru', value: '#3B82F6' },
  { label: 'Hijau', value: '#22C55E' },
  { label: 'Merah', value: '#EF4444' },
  { label: 'Ungu', value: '#A855F7' },
  { label: 'Oranye', value: '#F97316' },
  { label: 'Kuning', value: '#EAB308' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Teal', value: '#14B8A6' },
];

export default function ClassroomDetailPage() {
  const params = useParams();
  const classroomId = params.id as string;
  const { accessToken } = useAuthStore();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [unenrollingStudent, setUnenrollingStudent] = useState<any | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () =>
      graphqlRequest(CLASSROOM_QUERIES.DETAIL, { classroomId }, { token: accessToken }),
    enabled: !!accessToken && !!classroomId,
  });

  const classroom = data?.classroomDetail;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          {error ? (error as Error).message : 'Kelas tidak ditemukan'}
        </p>
        <Link href="/dashboard/classrooms">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/classrooms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{classroom.name}</h1>
          {classroom.description && (
            <p className="text-muted-foreground mt-0.5">{classroom.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{classroom.studentCount} siswa</span>
          <span className="mx-1">·</span>
          <BookOpen className="h-4 w-4" />
          <span>{classroom.subjectCount} mapel</span>
        </div>
      </div>

      {/* Subject & Student Sections side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUBJECTS SECTION */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Mata Pelajaran</CardTitle>
            <Button size="sm" onClick={() => setShowAddSubject(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent>
            {classroom.subjects.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada mata pelajaran</p>
              </div>
            ) : (
              <div className="space-y-2">
                {classroom.subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: subject.color
                            ? `${subject.color}20`
                            : '#f3f4f6',
                        }}
                      >
                        {subject.icon || '📚'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject.moduleCount} modul
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingSubject(subject)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => setDeletingSubjectId(subject.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* STUDENTS SECTION */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Siswa Terdaftar</CardTitle>
            <Button size="sm" onClick={() => setShowEnrollModal(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Tambah Siswa
            </Button>
          </CardHeader>
          <CardContent>
            {classroom.students.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada siswa terdaftar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {classroom.students.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {enrollment.student.user.studentName?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {enrollment.student.user.studentName || 'Siswa'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {enrollment.student.level} · {enrollment.student.totalXP} XP
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.student.user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {enrollment.student.user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() =>
                          setUnenrollingStudent({
                            userId: enrollment.student.user.id,
                            name: enrollment.student.user.studentName,
                          })
                        }
                        title="Keluarkan dari kelas"
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODALS */}
      {(showAddSubject || editingSubject) && (
        <SubjectFormModal
          classroomId={classroomId}
          subject={editingSubject}
          onClose={() => {
            setShowAddSubject(false);
            setEditingSubject(null);
          }}
        />
      )}

      {deletingSubjectId && (
        <DeleteSubjectModal
          subjectId={deletingSubjectId}
          classroomId={classroomId}
          onClose={() => setDeletingSubjectId(null)}
        />
      )}

      {showEnrollModal && (
        <EnrollStudentModal
          classroomId={classroomId}
          onClose={() => setShowEnrollModal(false)}
        />
      )}

      {unenrollingStudent && (
        <UnenrollConfirmModal
          classroomId={classroomId}
          studentUserId={unenrollingStudent.userId}
          studentName={unenrollingStudent.name}
          onClose={() => setUnenrollingStudent(null)}
        />
      )}
    </div>
  );
}

// ============================================
// SUBJECT FORM MODAL
// ============================================

function SubjectFormModal({
  classroomId,
  subject,
  onClose,
}: {
  classroomId: string;
  subject: any | null;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const isEdit = !!subject;
  const [name, setName] = useState(subject?.name || '');
  const [description, setDescription] = useState(subject?.description || '');
  const [icon, setIcon] = useState(subject?.icon || '📚');
  const [color, setColor] = useState(subject?.color || '#3B82F6');

  const createMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(SUBJECT_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(SUBJECT_MUTATIONS.UPDATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      updateMutation.mutate({ id: subject.id, name: name.trim(), description: description.trim() || undefined, icon, color });
    } else {
      createMutation.mutate({ classroomId, name: name.trim(), description: description.trim() || undefined, icon, color });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Nama Mata Pelajaran *</Label>
            <Input
              id="subjectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Matematika"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectDesc">Deskripsi (opsional)</Label>
            <Input
              id="subjectDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Ikon</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border-2 transition-colors ${
                    icon === ic
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {mutationError && (
            <p className="text-sm text-red-500">{(mutationError as Error).message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// DELETE SUBJECT MODAL
// ============================================

function DeleteSubjectModal({
  subjectId,
  classroomId,
  onClose,
}: {
  subjectId: string;
  classroomId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(SUBJECT_MUTATIONS.DELETE, { subjectId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Mata Pelajaran?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Semua modul dan materi terkait akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
        </p>
        {deleteMutation.error && (
          <p className="text-sm text-red-500 mb-4">
            {(deleteMutation.error as Error).message}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleteMutation.isPending}>
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ENROLL STUDENT MODAL
// ============================================

function EnrollStudentModal({
  classroomId,
  onClose,
}: {
  classroomId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['availableStudents', classroomId],
    queryFn: () =>
      graphqlRequest(CLASSROOM_QUERIES.AVAILABLE_STUDENTS, { classroomId }, { token: accessToken }),
    enabled: !!accessToken,
  });

  const available = data?.availableStudents || [];

  const enrollMutation = useMutation({
    mutationFn: (studentUserId: string) =>
      graphqlRequest(
        CLASSROOM_MUTATIONS.ENROLL_STUDENT,
        { input: { classroomId, studentUserId } },
        { token: accessToken },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['availableStudents', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Tambah Siswa ke Kelas</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : available.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Semua siswa sudah terdaftar di kelas ini
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {available.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {student.user.studentName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.user.studentName || 'Siswa'}</p>
                      <p className="text-xs text-muted-foreground">{student.user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => enrollMutation.mutate(student.user.id)}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {enrollMutation.error && (
            <p className="text-sm text-red-500 mt-3">{(enrollMutation.error as Error).message}</p>
          )}
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// UNENROLL CONFIRM MODAL
// ============================================

function UnenrollConfirmModal({
  classroomId,
  studentUserId,
  studentName,
  onClose,
}: {
  classroomId: string;
  studentUserId: string;
  studentName: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const unenrollMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(
        CLASSROOM_MUTATIONS.UNENROLL_STUDENT,
        { input: { classroomId, studentUserId } },
        { token: accessToken },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Keluarkan Siswa?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          <strong>{studentName}</strong> akan dikeluarkan dari kelas ini.
        </p>
        {unenrollMutation.error && (
          <p className="text-sm text-red-500 mb-4">
            {(unenrollMutation.error as Error).message}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={unenrollMutation.isPending}>
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => unenrollMutation.mutate()}
            disabled={unenrollMutation.isPending}
          >
            {unenrollMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Keluarkan
          </Button>
        </div>
      </div>
    </div>
  );
}
