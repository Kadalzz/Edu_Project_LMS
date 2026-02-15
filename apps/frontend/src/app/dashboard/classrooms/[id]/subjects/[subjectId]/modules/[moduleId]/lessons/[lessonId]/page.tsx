'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  LESSON_QUERIES,
  LESSON_MUTATIONS,
} from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Image,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function LessonEditorPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () =>
      graphqlRequest(LESSON_QUERIES.DETAIL, { lessonId }, { token: accessToken }),
    enabled: !!accessToken && !!lessonId,
  });

  const lesson = data?.lessonDetail;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setContent(lesson.content || '');
      setHasChanges(false);
    }
  }, [lesson]);

  // Track changes
  useEffect(() => {
    if (lesson) {
      const changed =
        title !== (lesson.title || '') ||
        description !== (lesson.description || '') ||
        content !== (lesson.content || '');
      setHasChanges(changed);
    }
  }, [title, description, content, lesson]);

  const saveMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(LESSON_MUTATIONS.UPDATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      setHasChanges(false);
    },
  });

  const toggleDraftMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(LESSON_MUTATIONS.TOGGLE_DRAFT, { lessonId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      id: lessonId,
      title: title.trim(),
      description: description.trim() || undefined,
      content: content.trim() || undefined,
    });
  };

  const backUrl = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          {error ? (error as Error).message : 'Materi tidak ditemukan'}
        </p>
        <Link href={backUrl}>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Editor Materi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lesson.isDraft ? '📝 Draft' : '✅ Published'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleDraftMutation.mutate()}
            disabled={toggleDraftMutation.isPending}
          >
            {toggleDraftMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : lesson.isDraft ? (
              <Eye className="h-4 w-4 mr-1.5" />
            ) : (
              <EyeOff className="h-4 w-4 mr-1.5" />
            )}
            {lesson.isDraft ? 'Publish' : 'Ke Draft'}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Simpan
          </Button>
        </div>
      </div>

      {(saveMutation.error || toggleDraftMutation.error) && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {((saveMutation.error || toggleDraftMutation.error) as Error).message}
        </div>
      )}

      {saveMutation.isSuccess && !hasChanges && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm">
          Materi berhasil disimpan!
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Materi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul materi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat materi"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Konten Materi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[300px] p-4 border rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Tulis konten materi di sini...&#10;&#10;Anda bisa menggunakan format teks sederhana untuk menjelaskan materi kepada siswa.&#10;&#10;Tips:&#10;- Gunakan bahasa yang sederhana dan mudah dipahami&#10;- Sertakan contoh konkret&#10;- Buat instruksi yang jelas dan terstruktur"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length} karakter
            </p>
          </CardContent>
        </Card>

        {/* Media Attachments (placeholder for Day 4 scope) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media Lampiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lesson.media && lesson.media.length > 0 ? (
              <div className="space-y-2">
                {lesson.media.map((lm: any) => (
                  <div
                    key={lm.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                      {lm.media.type === 'IMAGE' ? '🖼️' : lm.media.type === 'VIDEO' ? '🎥' : lm.media.type === 'PDF' ? '📄' : '🎵'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lm.media.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {lm.media.type} · {(lm.media.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <Image className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Belum ada media</p>
                <p className="text-xs text-muted-foreground">
                  Fitur upload media akan tersedia dalam update berikutnya
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
