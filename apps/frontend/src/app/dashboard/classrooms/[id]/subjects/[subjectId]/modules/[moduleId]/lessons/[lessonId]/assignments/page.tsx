'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  ASSIGNMENT_QUERIES,
  ASSIGNMENT_MUTATIONS,
} from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ClipboardList,
  FileQuestion,
  ListChecks,
  Users,
  Star,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();

  const isTeacher = user?.role === 'TEACHER';

  // State for create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'QUIZ' | 'TASK_ANALYSIS'>('QUIZ');
  const [newXpReward, setNewXpReward] = useState(10);
  const [newDueDate, setNewDueDate] = useState('');

  // State for delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignments', lessonId],
    queryFn: () =>
      graphqlRequest(ASSIGNMENT_QUERIES.BY_LESSON, { lessonId }, { token: accessToken }),
    enabled: !!accessToken && !!lessonId,
  });

  const assignments = data?.assignments || [];

  const createMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      setShowCreateForm(false);
      setNewTitle('');
      setNewDescription('');
      setNewType('QUIZ');
      setNewXpReward(10);
      setNewDueDate('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.DELETE, { assignmentId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      setDeletingId(null);
    },
  });

  const toggleDraftMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.TOGGLE_DRAFT, { assignmentId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', lessonId] });
    },
  });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createMutation.mutate({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      type: newType,
      lessonId,
      xpReward: newXpReward,
      dueDate: newDueDate || undefined,
      isDraft: true,
    });
  };

  const basePath = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}`;
  const backUrl = basePath;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tugas & Quiz</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {assignments.length} tugas
            </p>
          </div>
        </div>
        {isTeacher && (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Tugas
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {(error as Error).message}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Buat Tugas Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newTitle">Judul *</Label>
              <Input
                id="newTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul tugas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDesc">Deskripsi</Label>
              <Input
                id="newDesc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Deskripsi tugas (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipe Tugas</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewType('QUIZ')}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    newType === 'QUIZ'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileQuestion className="h-5 w-5 mx-auto mb-1" />
                  Quiz
                </button>
                <button
                  onClick={() => setNewType('TASK_ANALYSIS')}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    newType === 'TASK_ANALYSIS'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ListChecks className="h-5 w-5 mx-auto mb-1" />
                  Task Analysis
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  min={0}
                  value={newXpReward}
                  onChange={(e) => setNewXpReward(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Deadline (Opsional)</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>

            {createMutation.error && (
              <p className="text-sm text-red-500">
                {(createMutation.error as Error).message}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending || !newTitle.trim()}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                Buat Tugas
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada tugas</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isTeacher
                ? 'Buat tugas pertama untuk materi ini'
                : 'Guru belum membuat tugas untuk materi ini'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      router.push(`${basePath}/assignments/${assignment.id}`)
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {assignment.type === 'QUIZ' ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileQuestion className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <ListChecks className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            assignment.type === 'QUIZ'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {assignment.type === 'QUIZ' ? 'Quiz' : 'Task Analysis'}
                          </span>
                          {assignment.isDraft && (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mt-2 ml-10">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 ml-10 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-3 w-3" />
                        {assignment.questionCount} soal/langkah
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {assignment.xpReward} XP
                      </span>
                      {isTeacher && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {assignment.submissionCount} submission
                        </span>
                      )}
                      {assignment.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(assignment.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teacher actions */}
                  {isTeacher && (
                    <div className="flex items-center gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleDraftMutation.mutate(assignment.id)}
                        title={assignment.isDraft ? 'Publish' : 'Ke Draft'}
                      >
                        {assignment.isDraft ? (
                          <Eye className="h-4 w-4 text-gray-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      {deletingId === assignment.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => deleteMutation.mutate(assignment.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Ya'
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setDeletingId(null)}
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeletingId(assignment.id)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
