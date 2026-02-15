'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  SUBJECT_QUERIES,
  MODULE_MUTATIONS,
  MODULE_QUERIES,
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
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const classroomId = params.id as string;
  const { accessToken } = useAuthStore();
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () =>
      graphqlRequest(SUBJECT_QUERIES.DETAIL, { subjectId }, { token: accessToken }),
    enabled: !!accessToken && !!subjectId,
  });

  const subject = data?.subjectDetail;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          {error ? (error as Error).message : 'Mata pelajaran tidak ditemukan'}
        </p>
        <Link href={`/dashboard/classrooms/${classroomId}`}>
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
        <Link href={`/dashboard/classrooms/${classroomId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{
              backgroundColor: subject.color ? `${subject.color}20` : '#f3f4f6',
            }}
          >
            {subject.icon || '📚'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            {subject.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>{subject.moduleCount} modul</span>
        </div>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Modul Pembelajaran</CardTitle>
          <Button size="sm" onClick={() => setShowAddModule(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Tambah Modul
          </Button>
        </CardHeader>
        <CardContent>
          {subject.modules.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">Belum ada modul</p>
              <p className="text-xs text-muted-foreground">
                Tambahkan modul untuk mengorganisir materi pelajaran
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {subject.modules.map((mod: any, index: number) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{mod.name}</p>
                        {!mod.isActive && (
                          <span className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      {mod.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {mod.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {mod.lessonCount} materi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingModule(mod)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => setDeletingModuleId(mod.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${mod.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODALS */}
      {(showAddModule || editingModule) && (
        <ModuleFormModal
          subjectId={subjectId}
          module={editingModule}
          onClose={() => {
            setShowAddModule(false);
            setEditingModule(null);
          }}
        />
      )}

      {deletingModuleId && (
        <DeleteModuleModal
          moduleId={deletingModuleId}
          subjectId={subjectId}
          onClose={() => setDeletingModuleId(null)}
        />
      )}
    </div>
  );
}

// ============================================
// MODULE FORM MODAL
// ============================================

function ModuleFormModal({
  subjectId,
  module: mod,
  onClose,
}: {
  subjectId: string;
  module: any | null;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const isEdit = !!mod;
  const [name, setName] = useState(mod?.name || '');
  const [description, setDescription] = useState(mod?.description || '');

  const createMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(MODULE_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(MODULE_MUTATIONS.UPDATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      onClose();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      updateMutation.mutate({
        id: mod.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        subjectId,
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
            {isEdit ? 'Edit Modul' : 'Tambah Modul'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moduleName">Nama Modul *</Label>
            <Input
              id="moduleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pengenalan Angka"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moduleDesc">Deskripsi (opsional)</Label>
            <Input
              id="moduleDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat modul"
            />
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
// DELETE MODULE MODAL
// ============================================

function DeleteModuleModal({
  moduleId,
  subjectId,
  onClose,
}: {
  moduleId: string;
  subjectId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(MODULE_MUTATIONS.DELETE, { moduleId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Modul?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Semua materi dalam modul ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
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
