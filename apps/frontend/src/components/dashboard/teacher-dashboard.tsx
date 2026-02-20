'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, USER_QUERIES, PROGRESS_QUERIES, ASSIGNMENT_QUERIES, NOTE_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, ClipboardList, Loader2, Clock, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { LevelBadge } from './progress-components';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function TeacherDashboard() {
  const { user, accessToken } = useAuthStore();

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['myStudents'],
    queryFn: () => graphqlRequest(USER_QUERIES.MY_STUDENTS, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const { data: classroomsData, isLoading: classroomsLoading } = useQuery({
    queryKey: ['myClassrooms'],
    queryFn: () => graphqlRequest(USER_QUERIES.MY_CLASSROOMS, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingGrading'],
    queryFn: () => graphqlRequest(ASSIGNMENT_QUERIES.PENDING_GRADING, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const { data: recentNotesData, isLoading: notesLoading } = useQuery({
    queryKey: ['recentNotesForTeacher'],
    queryFn: () => graphqlRequest(NOTE_QUERIES.RECENT_FOR_TEACHER, { limit: 5 }, { token: accessToken }),
    enabled: !!accessToken,
  });

  const students = studentsData?.myStudents || [];
  const classrooms = classroomsData?.myClassrooms || [];
  const pendingSubmissions = pendingData?.pendingGrading || [];
  const recentNotes = recentNotesData?.recentNotesForTeacher || [];
  const activeStudents = students.filter((s: any) => s.user.isActive).length;

  return (
    <div className="section-spacing">
      <div>
        <h1>
          Selamat datang, {user?.teacherName || 'Guru'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan kelas Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Siswa"
          value={studentsLoading ? '...' : String(students.length)}
          subtitle={`${activeStudents} aktif`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Kelas"
          value={classroomsLoading ? '...' : String(classrooms.length)}
          subtitle="Kelas aktif"
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="Perlu Dinilai"
          value={pendingLoading ? '...' : String(pendingSubmissions.length)}
          subtitle="Tugas pending"
          icon={ClipboardList}
          color="orange"
        />
        <StatsCard
          title="Materi"
          value="0"
          subtitle="Akan ditambahkan"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Pending Grading Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Perlu Dinilai
            </CardTitle>
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive">{pendingSubmissions.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Semua tugas sudah dinilai! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tidak ada tugas yang perlu dinilai saat ini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((submission: any) => (
                <Link
                  key={submission.id}
                  href={`/dashboard/submissions/${submission.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <LevelBadge level={submission.student.level} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {submission.student.studentName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {submission.assignment.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={submission.assignment.type === 'QUIZ' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {submission.assignment.type === 'QUIZ' ? 'Kuis' : 'Analisis Tugas'}
                        </Badge>
                        {submission.pendingStepsCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {submission.pendingStepsCount} langkah pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {submission.submittedAt
                          ? formatDistanceToNow(new Date(submission.submittedAt), {
                              addSuffix: true,
                              locale: idLocale,
                            })
                          : 'Baru saja'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notes from Parents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Catatan Terbaru dari Orang Tua
            </CardTitle>
            {recentNotes.length > 0 && (
              <Badge variant="secondary">{recentNotes.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada catatan dari orang tua</p>
              <p className="text-sm text-muted-foreground mt-1">
                Catatan dari orang tua akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note: any) => (
                <Link
                  key={note.id}
                  href={`/dashboard/students/${note.studentId}`}
                  className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {note.writtenBy.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {note.writtenBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tentang: <span className="font-medium">{note.student?.name || 'Siswa'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.createdAt), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {note.content}
                    </p>
                    {note.replyCount > 0 && (
                      <Badge variant="outline" className="text-xs mt-2">
                        {note.replyCount} balasan
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada siswa terdaftar</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan siswa melalui menu &quot;Siswa&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student: any) => (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LevelBadge level={student.level} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.user.studentName || 'Siswa'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {student.level} · {student.totalXP} XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
