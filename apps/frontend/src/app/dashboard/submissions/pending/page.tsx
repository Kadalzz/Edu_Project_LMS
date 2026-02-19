'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, CheckCircle, Clock, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const PENDING_GRADING_QUERY = `
  query PendingGrading {
    pendingGrading {
      id
      assignmentId
      studentId
      status
      score
      submittedAt
      pendingStepsCount
      student {
        id
        userId
        level
        totalXP
        studentName
      }
      assignment {
        id
        title
        type
        lessonId
      }
    }
  }
`;

interface PendingSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  score: number | null;
  submittedAt: string;
  pendingStepsCount?: number;
  student: {
    id: string;
    userId: string;
    level: number;
    totalXP: number;
    studentName: string;
  };
  assignment: {
    id: string;
    title: string;
    type: 'QUIZ' | 'TASK_ANALYSIS';
    lessonId: string;
  };
}

export default function PendingGradingPage() {
  const { user, accessToken } = useAuthStore();

  // Redirect if not teacher
  if (user?.role !== 'TEACHER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-muted-foreground">Halaman ini hanya untuk guru</p>
      </div>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingGrading'],
    queryFn: () => graphqlRequest(PENDING_GRADING_QUERY, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const pendingSubmissions: PendingSubmission[] = data?.pendingGrading || [];

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return 'Kuis';
      case 'TASK_ANALYSIS':
        return 'Task Analysis';
      default:
        return type;
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return 'bg-blue-100 text-blue-700';
      case 'TASK_ANALYSIS':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Penilaian Tertunda' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penilaian Tertunda</h1>
          <p className="text-muted-foreground mt-1">
            {pendingSubmissions.length} penilaian menunggu
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error: {(error as Error).message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && pendingSubmissions.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada penilaian tertunda</h3>
          <p className="text-muted-foreground mb-4">
            Semua tugas siswa sudah dinilai
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Kembali ke Dashboard
            </Link>
          </Button>
        </div>
      )}

      {/* Pending Submissions List */}
      {!isLoading && !error && pendingSubmissions.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tertunda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{pendingSubmissions.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Kuis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {pendingSubmissions.filter(s => s.assignment.type === 'QUIZ').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Task Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {pendingSubmissions.filter(s => s.assignment.type === 'TASK_ANALYSIS').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tugas Tertunda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:border-primary/50 hover:bg-accent/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getAssignmentTypeColor(submission.assignment.type)}>
                            {getAssignmentTypeLabel(submission.assignment.type)}
                          </Badge>
                          {submission.pendingStepsCount !== undefined && submission.pendingStepsCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {submission.pendingStepsCount} langkah tertunda
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {submission.assignment.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{submission.student.studentName}</span>
                            <span className="text-xs">•</span>
                            <span className="text-xs">
                              Level {submission.student.level} ({submission.student.totalXP} XP)
                            </span>
                          </div>
                        </div>

                        {submission.submittedAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              Dikumpulkan {formatDistanceToNow(new Date(submission.submittedAt), { 
                                addSuffix: true,
                                locale: localeId 
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <Button asChild size="sm">
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            Nilai Sekarang
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
