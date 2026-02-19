'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, CLASSROOM_QUERIES, CLASSROOM_MUTATIONS } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
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
import { toast } from 'sonner';

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
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);

  // Redirect if not teacher
  if (user?.role !== 'TEACHER') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Halaman ini hanya untuk guru</p>
      </div>
    );
  }

  const handleDelete = (classroom: Classroom) => {
    setDeletingClassroom(classroom);
  };

  const confirmDelete = () => {
    if (!deletingClassroom) return;
    deleteClassroom(deletingClassroom.id);
  };

  const deleteClassroom = (id: string) => {
    graphqlRequest(CLASSROOM_MUTATIONS.DELETE, { classroomId: id }, { token: accessToken })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['classrooms'] });
        queryClient.invalidateQueries({ queryKey: ['myClassrooms'] });
        toast.success('Kelas berhasil dihapus');
        setDeletingClassroom(null);
      })
      .catch((error) => {
        toast.error('Gagal menghapus kelas: ' + (error.message || 'Terjadi kesalahan'));
      });
  };

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
      {deletingClassroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingClassroom(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Kelas?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus kelas &quot;{deletingClassroom.name}&quot;? 
              Semua data terkait akan ikut terhapus dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeletingClassroom(null)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom List */}
      <ClassroomList
        onEdit={setEditingClassroom}
        onDelete={handleDelete}
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
  onDelete: (c: Classroom) => void;
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
        <span className="ml-3 text-muted-foreground">Memuat data kelas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex flex-col items-center">
          <p className="text-red-600 font-medium mb-2">Gagal memuat data kelas</p>
          <p className="text-sm text-gray-500">Coba muat ulang halaman atau hubungi administrator</p>
        </div>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Belum ada kelas"
        description="Klik tombol 'Tambah Kelas' di atas untuk membuat kelas pertama Anda"
      />
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
                onClick={() => onDelete(classroom)}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kelas harus diisi');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const input = isEdit
      ? { id: classroom.id, name: name.trim(), description: description.trim() || undefined }
      : { name: name.trim(), description: description.trim() || undefined };

    const mutation = isEdit ? CLASSROOM_MUTATIONS.UPDATE : CLASSROOM_MUTATIONS.CREATE;

    graphqlRequest(mutation, { input }, { token: accessToken })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['classrooms'] });
        queryClient.invalidateQueries({ queryKey: ['myClassrooms'] });
        toast.success(isEdit ? 'Kelas berhasil diperbarui' : 'Kelas berhasil dibuat');
        onClose();
      })
      .catch((error) => {
        const errorMessage = error.message || 'Terjadi kesalahan';
        setError(errorMessage);
        toast.error(isEdit ? 'Gagal memperbarui kelas' : 'Gagal membuat kelas');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" disabled={isSubmitting}>
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
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang kelas"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
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
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? 'Simpan' : 'Buat Kelas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
