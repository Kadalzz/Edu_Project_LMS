'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, USER_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, ClipboardList, Loader2 } from 'lucide-react';

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

  const students = studentsData?.myStudents || [];
  const classrooms = classroomsData?.myClassrooms || [];
  const activeStudents = students.filter((s: any) => s.user.isActive).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {user?.teacherName || 'Guru'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan kelas Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          title="Materi"
          value="0"
          subtitle="Akan ditambahkan"
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Tugas"
          value="0"
          subtitle="Belum ada tugas"
          icon={ClipboardList}
          color="orange"
        />
      </div>

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
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {student.user.studentName?.charAt(0) || 'S'}
                      </span>
                    </div>
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
                </div>
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
