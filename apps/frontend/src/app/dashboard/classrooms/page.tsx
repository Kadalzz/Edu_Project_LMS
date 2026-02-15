'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, CLASSROOM_QUERIES, CLASSROOM_MUTATIONS } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  Loader2,
  Pencil,
  Trash2,
  X,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface Classroom {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  studentCount: number;
  subjectCount: number;
  createdAt: string;
}

export default function ClassroomsPage() {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not teacher
  if (user?.role !== 'TEACHER') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Halaman ini hanya untuk guru</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
          <p className="text-muted-foreground mt-1">Kelola kelas dan siswa</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {/* Create / Edit Form Modal */}
      {(showCreateForm || editingClassroom) && (
        <ClassroomFormModal
          classroom={editingClassroom}
          onClose={() => {
            setShowCreateForm(false);
            setEditingClassroom(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <DeleteConfirmModal
          classroomId={deletingId}
          onClose={() => setDeletingId(null)}
        />
      )}

      {/* Classroom List */}
      <ClassroomList
        onEdit={setEditingClassroom}
        onDelete={setDeletingId}
      />
    </div>
  );
}

// ============================================
// CLASSROOM LIST
// ============================================

function ClassroomList({
  onEdit,
  onDelete,
}: {
  onEdit: (c: Classroom) => void;
  onDelete: (id: string) => void;
}) {
  const { accessToken } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () =>
      graphqlRequest(CLASSROOM_QUERIES.LIST, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const classrooms: Classroom[] = data?.classrooms || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kelas</h3>
        <p className="text-muted-foreground">
          Klik &quot;Tambah Kelas&quot; untuk membuat kelas baru
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classrooms.map((classroom) => (
        <Card key={classroom.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{classroom.name}</CardTitle>
                  {classroom.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {classroom.description}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  classroom.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {classroom.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{classroom.studentCount} siswa</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{classroom.subjectCount} mapel</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/classrooms/${classroom.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Detail
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(classroom)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(classroom.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// CREATE / EDIT FORM MODAL
// ============================================

function ClassroomFormModal({
  classroom,
  onClose,
}: {
  classroom: Classroom | null;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const isEdit = !!classroom;
  const [name, setName] = useState(classroom?.name || '');
  const [description, setDescription] = useState(classroom?.description || '');

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      graphqlRequest(CLASSROOM_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['myClassrooms'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; description?: string }) =>
      graphqlRequest(CLASSROOM_MUTATIONS.UPDATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['myClassrooms'] });
      onClose();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      updateMutation.mutate({
        id: classroom.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kelas *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kelas 1A"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang kelas"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{(error as Error).message}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isEdit ? 'Simpan' : 'Buat Kelas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({
  classroomId,
  onClose,
}: {
  classroomId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(CLASSROOM_MUTATIONS.DELETE, { classroomId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['myClassrooms'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Kelas?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Semua data terkait kelas ini (siswa terdaftar, mata pelajaran, dll) akan ikut terhapus.
          Tindakan ini tidak bisa dibatalkan.
        </p>
        {deleteMutation.error && (
          <p className="text-sm text-red-500 mb-4">
            {(deleteMutation.error as Error).message}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
