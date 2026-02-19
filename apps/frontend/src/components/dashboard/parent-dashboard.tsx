'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, PROGRESS_QUERIES, USER_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Award, Loader2, Calendar } from 'lucide-react';
import { LevelBadge, SubjectProgressBar } from './progress-components';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export function ParentDashboard() {
  const { user, accessToken } = useAuthStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Fetch children list
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['myChildren'],
    queryFn: async () => {
      const result = await graphqlRequest(
        `query MyChildren {
          me {
            id
            children {
              id
              userId
              level
              totalXP
              user {
                id
                studentName
              }
            }
          }
        }`,
        undefined,
        { token: accessToken }
      );
      return result.me.children || [];
    },
    enabled: !!accessToken && user?.role === 'STUDENT_PARENT',
  });

  const children = childrenData || [];
  const currentChild = selectedChildId 
    ? children.find((c: any) => c.id === selectedChildId)
    : children[0];

  // Auto-select first child
  if (!selectedChildId && children.length > 0) {
    setSelectedChildId(children[0].id);
  }

  // Fetch selected child stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['childStats', currentChild?.id],
    queryFn: () => graphqlRequest(
      PROGRESS_QUERIES.STUDENT_STATS, 
      { studentId: currentChild.id }, 
      { token: accessToken }
    ),
    enabled: !!accessToken && !!currentChild?.id,
  });

  const childStats = statsData?.studentStats;

  if (childrenLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tidak Ada Anak Terdaftar
        </h2>
        <p className="text-muted-foreground">
          Hubungi guru untuk mendaftarkan anak Anda
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Orang Tua 👨‍👩‍👧
        </h1>
        <p className="text-muted-foreground mt-1">
          Pantau perkembangan belajar anak Anda
        </p>
      </div>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Pilih Anak:</span>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Pilih anak" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child: any) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.user.studentName} - Level {child.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Child Header */}
      {currentChild && (
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <LevelBadge level={currentChild.level} size="lg" className="shadow-xl" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{currentChild.user.studentName}</h2>
                <p className="text-white/80">
                  Level {currentChild.level} • {currentChild.totalXP} Total XP
                </p>
              </div>
              <Link
                href={`/dashboard/students/${currentChild.id}`}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Lihat Detail
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : childStats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-3xl font-bold text-blue-600">{childStats.level}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {childStats.levelProgress?.toFixed(0)}% ke level berikutnya
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tugas Selesai</p>
                    <p className="text-3xl font-bold text-green-600">
                      {childStats.totalAssignmentsCompleted}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total tugas</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {childStats.averageScore?.toFixed(0) || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Dari 100</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {childStats.totalXP}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {childStats.currentXP} XP di level ini
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Progress */}
          {childStats.subjectProgress && childStats.subjectProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress per Mata Pelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {childStats.subjectProgress.map((subject: any) => (
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
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Data tidak tersedia</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
