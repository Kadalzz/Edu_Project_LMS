'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, ASSIGNMENT_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Award, Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isPast } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface Assignment {
  id: string;
  assignmentId: string;
  status: string;
  score: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
  assignment: {
    id: string;
    title: string;
    type: string;
    dueDate: string | null;
    xpReward: number;
  };
}

export default function AssignmentsPage() {
  const { user, accessToken } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Redirect if not student
  if (user?.role !== 'STUDENT_PARENT') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-muted-foreground">Halaman ini hanya untuk siswa</p>
      </div>
    );
  }

  // Fetch all submissions (includes all statuses)
  const { data: gradesData, isLoading, error } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => graphqlRequest(ASSIGNMENT_QUERIES.RECENT_GRADES, { limit: 100 }, { token: accessToken }),
    enabled: !!accessToken,
  });

  const assignments: Assignment[] = gradesData?.recentGrades || [];

  // Filter assignments by status
  const filteredAssignments = assignments.filter((assignment) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return assignment.status === 'PENDING' || assignment.status === 'IN_PROGRESS';
    if (selectedFilter === 'submitted') return assignment.status === 'SUBMITTED';
    if (selectedFilter === 'graded') return assignment.status === 'GRADED';
    return true;
  });

  // Count by status
  const pendingCount = assignments.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length;
  const submittedCount = assignments.filter(a => a.status === 'SUBMITTED').length;
  const gradedCount = assignments.filter(a => a.status === 'GRADED').length;

  const getStatusBadge = (status: string, dueDate: string | null) => {
    if (status === 'GRADED') {
      return <Badge className="bg-green-100 text-green-700 border-green-300">✓ Dinilai</Badge>;
    }
    if (status === 'SUBMITTED') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">📤 Terkirim</Badge>;
    }
    if (status === 'IN_PROGRESS') {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">⏳ Sedang Dikerjakan</Badge>;
    }
    // Check if overdue
    if (dueDate && isPast(new Date(dueDate))) {
      return <Badge className="bg-red-100 text-red-700 border-red-300">⚠️ Terlambat</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-300">📝 Belum Dikerjakan</Badge>;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Daftar Tugas' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Tugas</h1>
        <p className="text-muted-foreground mt-1">
          Lihat semua tugas dan status pengerjaan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tugas</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Belum Selesai</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Penilaian</p>
                <p className="text-2xl font-bold">{submittedCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sudah Dinilai</p>
                <p className="text-2xl font-bold">{gradedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
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
      {!isLoading && !error && assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tugas</h3>
          <p className="text-muted-foreground">
            Guru belum memberikan tugas untuk kamu
          </p>
        </div>
      )}

      {/* Assignment List with Filters */}
      {!isLoading && !error && assignments.length > 0 && (
        <div>
          <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Semua ({assignments.length})</TabsTrigger>
              <TabsTrigger value="pending">Belum Selesai ({pendingCount})</TabsTrigger>
              <TabsTrigger value="submitted">Terkirim ({submittedCount})</TabsTrigger>
              <TabsTrigger value="graded">Dinilai ({gradedCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {assignment.assignment.type === 'QUIZ' ? '📝 Quiz' : '📋 Task'}
                        </Badge>
                        {getStatusBadge(assignment.status, assignment.assignment.dueDate)}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {assignment.assignment.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {assignment.assignment.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Deadline: {formatDistanceToNow(new Date(assignment.assignment.dueDate), {
                                addSuffix: true,
                                locale: idLocale,
                              })}
                            </span>
                            {isPast(new Date(assignment.assignment.dueDate)) && assignment.status !== 'GRADED' && (
                              <AlertCircle className="h-3 w-3 text-red-500 ml-1" />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>{assignment.assignment.xpReward} XP</span>
                        </div>
                      </div>

                      {assignment.status === 'GRADED' && assignment.gradedAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Dinilai {formatDistanceToNow(new Date(assignment.gradedAt), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                      {assignment.status === 'GRADED' && assignment.score !== null ? (
                        <div className="flex flex-col items-center">
                          <div
                            className={`text-3xl font-bold px-5 py-2 rounded-lg border-2 ${getScoreBadge(assignment.score)}`}
                          >
                            {assignment.score.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">/ 100</div>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/submissions/${assignment.id}`}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          {assignment.status === 'PENDING' ? 'Kerjakan' :
                            assignment.status === 'IN_PROGRESS' ? 'Lanjutkan' :
                              assignment.status === 'SUBMITTED' ? 'Lihat' :
                                'Detail'}
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results After Filter */}
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada tugas dengan status {selectedFilter === 'pending' ? 'belum selesai' :
                  selectedFilter === 'submitted' ? 'terkirim' :
                    selectedFilter === 'graded' ? 'dinilai' : 'ini'}
              </h3>
              <p className="text-muted-foreground">
                Coba pilih filter lain
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
tml:function_calls>
<invoke name="useAuthStore">
<parameter name="component">@/lib/auth-store