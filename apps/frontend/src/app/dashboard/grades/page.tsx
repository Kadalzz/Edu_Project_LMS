'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, ASSIGNMENT_QUERIES, PROGRESS_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, CheckCircle2, Award, TrendingUp, Star, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface Grade {
  id: string;
  assignmentId: string;
  status: string;
  score: number | null;
  gradedAt: string | null;
  assignment: {
    id: string;
    title: string;
    type: string;
  };
}

export default function GradesPage() {
  const { user, accessToken } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'quiz' | 'task'>('all');

  // Redirect if not student
  if (user?.role !== 'STUDENT_PARENT') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Trophy className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-muted-foreground">Halaman ini hanya untuk siswa</p>
      </div>
    );
  }

  // Get student profile
  const { data: studentData } = useQuery({
    queryKey: ['studentProfile', user?.id],
    queryFn: async () => {
      const result = await graphqlRequest(
        `query Me { me { id studentProfile { id } } }`,
        undefined,
        { token: accessToken }
      );
      return result.me.studentProfile;
    },
    enabled: !!accessToken,
  });

  const studentId = studentData?.id;

  // Fetch all grades (no limit)
  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useQuery({
    queryKey: ['allGrades'],
    queryFn: () => graphqlRequest(ASSIGNMENT_QUERIES.RECENT_GRADES, { limit: 100 }, { token: accessToken }),
    enabled: !!accessToken,
  });

  // Fetch student stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', studentId],
    queryFn: () => graphqlRequest(PROGRESS_QUERIES.STUDENT_STATS, { studentId }, { token: accessToken }),
    enabled: !!accessToken && !!studentId,
  });

  const grades: Grade[] = gradesData?.recentGrades || [];
  const stats = statsData?.studentStats;

  // Filter grades
  const filteredGrades = grades.filter((grade) => {
    if (selectedFilter === 'all') return true;
    return grade.assignment.type === (selectedFilter === 'quiz' ? 'QUIZ' : 'TASK_ANALYSIS');
  });

  // Calculate statistics
  const gradedAssignments = grades.filter((g) => g.status === 'GRADED' && g.score !== null);
  const averageScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, g) => sum + (g.score || 0), 0) / gradedAssignments.length
    : 0;

  const highestScore = gradedAssignments.length > 0
    ? Math.max(...gradedAssignments.map((g) => g.score || 0))
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A (Excellent)';
    if (score >= 80) return 'B (Good)';
    if (score >= 70) return 'C (Average)';
    if (score >= 60) return 'D (Below Average)';
    return 'E (Needs Improvement)';
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Riwayat Nilai' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Nilai</h1>
        <p className="text-muted-foreground mt-1">
          Lihat semua nilai dan progress kamu
        </p>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && gradedAssignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Total Tugas Dinilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {gradedAssignments.length}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                dari {grades.length} tugas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rata-rata Nilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {averageScore.toFixed(1)}
              </div>
              <p className="text-xs text-green-700 mt-1">
                {getGradeLabel(averageScore)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Nilai Tertinggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                {highestScore.toFixed(0)}
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Best score achieved
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.totalXP.toLocaleString()}
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Level {stats.level}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {gradesLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {gradesError && (
        <div className="text-center py-12">
          <p className="text-red-500">Error: {(gradesError as Error).message}</p>
        </div>
      )}

      {/* Empty State */}
      {!gradesLoading && !gradesError && grades.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada nilai</h3>
          <p className="text-muted-foreground">
            Kerjakan tugas untuk mendapatkan nilai dan XP!
          </p>
        </div>
      )}

      {/* Grade List with Filters */}
      {!gradesLoading && !gradesError && grades.length > 0 && (
        <div>
          <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Semua ({grades.length})</TabsTrigger>
              <TabsTrigger value="quiz">
                Quiz ({grades.filter((g) => g.assignment.type === 'QUIZ').length})
              </TabsTrigger>
              <TabsTrigger value="task">
                Task ({grades.filter((g) => g.assignment.type === 'TASK_ANALYSIS').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredGrades.map((grade) => (
              <Card key={grade.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {grade.assignment.type === 'QUIZ' ? '📝 Quiz' : '📋 Task'}
                        </Badge>
                        <h3 className="font-semibold text-gray-900">
                          {grade.assignment.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {grade.status === 'GRADED' && grade.gradedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Dinilai {formatDistanceToNow(new Date(grade.gradedAt), {
                                addSuffix: true,
                                locale: idLocale,
                              })}
                            </span>
                          </div>
                        )}
                        {grade.status === 'SUBMITTED' && (
                          <Badge variant="secondary" className="text-xs">
                            Menunggu Penilaian
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {grade.status === 'GRADED' && grade.score !== null ? (
                        <>
                          <div className="text-right mr-4">
                            <div className="text-xs text-muted-foreground mb-1">Nilai</div>
                            <div className={`text-xs font-medium ${getScoreColor(grade.score)}`}>
                              {getGradeLabel(grade.score)}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`text-4xl font-bold px-6 py-3 rounded-lg border-2 ${getScoreBadge(grade.score)}`}
                            >
                              {grade.score.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">/ 100</div>
                          </div>
                        </>
                      ) : (
                        <Badge variant="secondary">
                          Belum dinilai
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results After Filter */}
          {filteredGrades.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada {selectedFilter === 'quiz' ? 'quiz' : selectedFilter === 'task' ? 'task' : 'tugas'}
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
