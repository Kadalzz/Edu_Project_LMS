'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  MODULE_QUERIES,
  LESSON_MUTATIONS,
} from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  FileText,
  Eye,
  EyeOff,
  ChevronRight,
  Image,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

export default function ModuleDetailPage() {
  const params = useParams();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const { accessToken } = useAuthStore();
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () =>
      graphqlRequest(MODULE_QUERIES.DETAIL, { moduleId }, { token: accessToken }),
    enabled: !!accessToken && !!moduleId,
  });

  const mod = data?.moduleDetail;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          {error ? (error as Error).message : 'Modul tidak ditemukan'}
        </p>
        <Link href={`/dashboard/classrooms/${classroomId}/subjects/${subjectId}`}>
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
        <Link href={`/dashboard/classrooms/${classroomId}/subjects/${subjectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{mod.name}</h1>
          {mod.description && (
            <p className="text-muted-foreground text-sm mt-0.5">{mod.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{mod.lessonCount} materi</span>
        </div>
      </div>

      {/* Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Daftar Materi</CardTitle>
          <Button size="sm" onClick={() => setShowAddLesson(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Tambah Materi
          </Button>
        </CardHeader>
        <CardContent>
          {mod.lessons.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">Belum ada materi</p>
              <p className="text-xs text-muted-foreground">
                Tambahkan materi untuk mulai mengajar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mod.lessons.map((lesson: any, index: number) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  classroomId={classroomId}
                  subjectId={subjectId}
                  moduleId={moduleId}
                  onEdit={() => setEditingLesson(lesson)}
                  onDelete={() => setDeletingLessonId(lesson.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODALS */}
      {(showAddLesson || editingLesson) && (
        <LessonFormModal
          moduleId={moduleId}
          lesson={editingLesson}
          onClose={() => {
            setShowAddLesson(false);
            setEditingLesson(null);
          }}
        />
      )}

      {deletingLessonId && (
        <DeleteLessonModal
          lessonId={deletingLessonId}
          moduleId={moduleId}
          onClose={() => setDeletingLessonId(null)}
        />
      )}
    </div>
  );
}

// ============================================
// LESSON ROW
// ============================================

function LessonRow({
  lesson,
  index,
  classroomId,
  subjectId,
  moduleId,
  onEdit,
  onDelete,
}: {
  lesson: any;
  index: number;
  classroomId: string;
  subjectId: string;
  moduleId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const toggleDraftMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(LESSON_MUTATIONS.TOGGLE_DRAFT, { lessonId: lesson.id }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
    },
  });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{lesson.title}</p>
            <span
              className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                lesson.isDraft
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {lesson.isDraft ? 'Draft' : 'Published'}
            </span>
          </div>
          {lesson.description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {lesson.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {lesson.mediaCount > 0 && (
              <span className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                {lesson.mediaCount} media
              </span>
            )}
            {lesson.assignmentCount > 0 && (
              <span className="flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                {lesson.assignmentCount} tugas
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggleDraftMutation.mutate()}
          disabled={toggleDraftMutation.isPending}
          title={lesson.isDraft ? 'Publish' : 'Kembali ke Draft'}
        >
          {toggleDraftMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : lesson.isDraft ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Link
          href={`/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lesson.id}`}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================
// LESSON FORM MODAL
// ============================================

function LessonFormModal({
  moduleId,
  lesson,
  onClose,
}: {
  moduleId: string;
  lesson: any | null;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const isEdit = !!lesson;
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');

  const createMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(LESSON_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(LESSON_MUTATIONS.UPDATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      onClose();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEdit) {
      updateMutation.mutate({
        id: lesson.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        moduleId,
        title: title.trim(),
        description: description.trim() || undefined,
        isDraft: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Materi' : 'Tambah Materi'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonTitle">Judul Materi *</Label>
            <Input
              id="lessonTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mengenal Angka 1-10"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lessonDesc">Deskripsi (opsional)</Label>
            <Input
              id="lessonDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat materi"
            />
          </div>

          {mutationError && (
            <p className="text-sm text-red-500">{(mutationError as Error).message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !title.trim()}>
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
// DELETE LESSON MODAL
// ============================================

function DeleteLessonModal({
  lessonId,
  moduleId,
  onClose,
}: {
  lessonId: string;
  moduleId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(LESSON_MUTATIONS.DELETE, { lessonId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Materi?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Semua tugas dan media terkait akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
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
