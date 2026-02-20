'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ClipboardList, Star, Trophy, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { graphqlRequest, PROGRESS_QUERIES, ASSIGNMENT_QUERIES } from '@/lib/graphql-client';
import { LevelBadge, XPProgress, SubjectProgressBar } from './progress-components';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function StudentDashboard() {
  const { user, accessToken } = useAuthStore();

  // Get student profile first
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['studentProfile', user?.id],
    queryFn: async () => {
      const result = await graphqlRequest(
        `query Me { me { id studentProfile { id } } }`,
        undefined,
        { token: accessToken }
      );
      return result.me.studentProfile;
    },
    enabled: !!accessToken && user?.role === 'STUDENT_PARENT',
  });

  const studentId = studentData?.id;

  // Fetch student stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', studentId],
    queryFn: () => graphqlRequest(PROGRESS_QUERIES.STUDENT_STATS, { studentId }, { token: accessToken }),
    enabled: !!accessToken && !!studentId,
  });

  // Fetch recent grades
  const { data: recentGradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['recentGrades'],
    queryFn: () => graphqlRequest(ASSIGNMENT_QUERIES.RECENT_GRADES, { limit: 5 }, { token: accessToken }),
    enabled: !!accessToken,
  });

  const studentStats = stats?.studentStats;
  const recentGrades = recentGradesData?.recentGrades || [];

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Mahir';
    if (level >= 4) return 'Menengah';
    return 'Pemula';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (studentLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <div>
        <h1>
          Halo, {user?.studentName || 'Siswa'}! 🌟
        </h1>
        <p className="text-muted-foreground mt-1">
          Ayo belajar dan kumpulkan XP!
        </p>
      </div>

      {/* XP & Level Card */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LevelBadge level={studentStats?.level || 1} size="lg" className="shadow-xl" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-6 w-6" />
                <span className="text-lg font-bold">
                  Level {studentStats?.level || 1} - {getLevelTitle(studentStats?.level || 1)}
                </span>
              </div>
              <p className="text-white/80 text-sm">
                {studentStats?.currentXP || 0} / {studentStats?.xpToNextLevel || 100} XP untuk naik level
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{studentStats?.totalXP || 0}</p>
            <p className="text-white/80 text-sm">Total XP</p>
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="mt-4 bg-white/30 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${studentStats?.levelProgress || 0}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{studentStats?.totalAssignmentsCompleted || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Tugas Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{studentStats?.averageScore?.toFixed(0) || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Rata-rata Nilai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{studentStats?.totalQuizzesCompleted || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Quiz Selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Nilai Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gradesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentGrades.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada nilai</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kerjakan tugas untuk mendapatkan nilai dan XP!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGrades.map((submission: any) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {submission.assignment.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={submission.assignment.type === 'QUIZ' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {submission.assignment.type === 'QUIZ' ? 'Kuis' : 'Analisis Tugas'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {submission.gradedAt
                          ? formatDistanceToNow(new Date(submission.gradedAt), {
                              addSuffix: true,
                              locale: idLocale,
                            })
                          : 'Baru saja'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
                      {submission.score?.toFixed(0)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadge(submission.score)}`}>
                      {submission.score >= 80 ? 'Bagus!' : submission.score >= 60 ? 'Cukup' : 'Perlu Ditingkatkan'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Progress */}
      {studentStats?.subjectProgress && studentStats.subjectProgress.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4">Progress per Mata Pelajaran</h3>
            <div className="space-y-4">
              {studentStats.subjectProgress.map((subject: any) => (
                <SubjectProgressBar
                  key={subject.subjectId}
                  subjectName={subject.subjectName}
                  completedLessons={subject.completedLessons}
                  totalLessons={subject.totalLessons}
                  color={subject.subjectColor || '#3b82f6'}
                  icon={subject.subjectIcon}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActionCard
          title="Pelajaran"
          description="Mulai belajar materi baru"
          icon={BookOpen}
          color="blue"
          href="/dashboard/lessons"
        />
        <QuickActionCard
          title="Tugas"
          description="Kerjakan tugas dari guru"
          icon={ClipboardList}
          color="green"
          href="/dashboard/assignments"
        />
        <QuickActionCard
          title="XP & Level"
          description="Lihat progress XP kamu"
          icon={Star}
          color="yellow"
          href="/dashboard/xp"
        />
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow';
  href: string;
}

const actionColorClasses = {
  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  green: 'bg-green-50 border-green-200 hover:bg-green-100',
  yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
};

function QuickActionCard({ title, description, icon: Icon, color }: QuickActionCardProps) {
  return (
    <Card className={`cursor-pointer transition-colors border-2 ${actionColorClasses[color]}`}>
      <CardContent className="p-6">
        <Icon className={`h-8 w-8 mb-3 ${iconColorClasses[color]}`} />
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
