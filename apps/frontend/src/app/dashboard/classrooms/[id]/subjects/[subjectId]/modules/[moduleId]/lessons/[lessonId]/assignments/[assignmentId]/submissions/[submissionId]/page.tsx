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
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  User,
  FileQuestion,
  ListChecks,
  Image as ImageIcon,
  Video,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const assignmentId = params.assignmentId as string;
  const submissionId = params.submissionId as string;
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();

  const isTeacher = user?.role === 'TEACHER';

  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissionDetail', submissionId],
    queryFn: () =>
      graphqlRequest(ASSIGNMENT_QUERIES.SUBMISSION_DETAIL, { submissionId }, { token: accessToken }),
    enabled: !!accessToken && !!submissionId,
  });

  const submission = data?.submissionDetail;

  const gradeMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.GRADE_SUBMISSION, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissionDetail', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
    },
  });

  const reviewStepMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.REVIEW_TASK_STEP, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissionDetail', submissionId] });
    },
  });

  const handleGrade = () => {
    const score = parseInt(gradeScore);
    if (isNaN(score) || score < 0 || score > 100) return;
    gradeMutation.mutate({
      submissionId,
      score,
      feedback: gradeFeedback.trim() || undefined,
    });
  };

  const handleReviewStep = (stepSubmissionId: string, status: string, comment?: string) => {
    reviewStepMutation.mutate({
      stepSubmissionId,
      status,
      comment,
    });
  };

  const basePath = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}/assignments/${assignmentId}`;
  const backUrl = basePath;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error ? (error as Error).message : 'Submission tidak ditemukan'}</p>
        <Link href={backUrl}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const isQuiz = submission.assignment?.type === 'QUIZ';

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Kelas', href: '/dashboard/classrooms' },
        { label: 'Detail Kelas', href: `/dashboard/classrooms/${classroomId}` },
        { label: 'Modul', href: `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}` },
        { label: 'Materi', href: `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}` },
        { label: submission.assignment?.title || 'Tugas', href: basePath },
        { label: `Submission - ${submission.student?.studentName || 'Siswa'}` }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Submission</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {submission.assignment?.title}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          submission.status === 'GRADED'
            ? 'bg-green-100 text-green-700'
            : submission.status === 'SUBMITTED'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {submission.status === 'GRADED' ? 'Dinilai' : submission.status === 'SUBMITTED' ? 'Dikumpulkan' : 'Draft'}
        </span>
      </div>

      {/* Student Info & Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{submission.student?.studentName || 'Siswa'}</p>
              <p className="text-xs text-muted-foreground">Level {submission.student?.level} · {submission.student?.totalXP} XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {submission.score !== null && submission.score !== undefined
                  ? `${Math.round(submission.score)}%`
                  : 'Belum dinilai'}
              </p>
              <p className="text-xs text-muted-foreground">
                XP Reward: {submission.assignment?.xpReward || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })
                  : 'Belum dikumpulkan'}
              </p>
              <p className="text-xs text-muted-foreground">Waktu submit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Answers */}
      {isQuiz && submission.quizAnswers && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Jawaban Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.quizAnswers.map((answer: any, index: number) => (
              <div
                key={answer.id}
                className={`p-3 rounded-lg border ${
                  answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Soal {index + 1}</span>
                    <span className="text-sm">→ Jawaban: <strong>{answer.selectedOption}</strong></span>
                  </div>
                  {answer.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
            <div className="pt-2 text-sm text-muted-foreground">
              Benar: {submission.quizAnswers.filter((a: any) => a.isCorrect).length}/{submission.quizAnswers.length}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Step Submissions */}
      {!isQuiz && submission.stepSubmissions && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Langkah Task Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.stepSubmissions.map((stepSub: any) => (
              <div key={stepSub.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">
                      Langkah {stepSub.step?.stepNumber}: {stepSub.step?.instruction}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {stepSub.photoUrl && (
                        <a href={stepSub.photoUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Lihat foto
                        </a>
                      )}
                      {stepSub.videoUrl && (
                        <a href={stepSub.videoUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Video className="h-3 w-3" /> Lihat video
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    stepSub.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : stepSub.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {stepSub.status === 'APPROVED' ? 'Disetujui' : stepSub.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                  </span>
                </div>

                {stepSub.comment && (
                  <div className="mt-2 p-2 rounded bg-blue-50 text-sm text-blue-700 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                    {stepSub.comment}
                  </div>
                )}

                {/* Teacher review actions */}
                {isTeacher && stepSub.status === 'PENDING' && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleReviewStep(stepSub.id, 'APPROVED', 'Bagus!')}
                      disabled={reviewStepMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Setuju
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleReviewStep(stepSub.id, 'REJECTED', 'Perlu diperbaiki')}
                      disabled={reviewStepMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grading Form (Teacher) */}
      {isTeacher && submission.status !== 'DRAFT' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {submission.status === 'GRADED' ? 'Update Penilaian' : 'Penilaian'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.grading && (
              <div className="p-3 rounded-lg bg-green-50 text-sm">
                <p className="font-medium text-green-700 mb-1">
                  Nilai saat ini: {Math.round(submission.grading.score)}%
                </p>
                {submission.grading.feedback && (
                  <p className="text-green-600">{submission.grading.feedback}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Nilai (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  placeholder="0-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (opsional)</Label>
                <Input
                  id="feedback"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Feedback untuk siswa"
                />
              </div>
            </div>

            {gradeMutation.error && (
              <p className="text-sm text-red-500">{(gradeMutation.error as Error).message}</p>
            )}
            {gradeMutation.isSuccess && (
              <p className="text-sm text-green-600">Penilaian berhasil disimpan!</p>
            )}

            <Button
              onClick={handleGrade}
              disabled={gradeMutation.isPending || !gradeScore}
            >
              {gradeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {submission.status === 'GRADED' ? 'Update Nilai' : 'Beri Nilai'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
