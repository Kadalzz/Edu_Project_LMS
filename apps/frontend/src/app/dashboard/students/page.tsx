'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, USER_QUERIES } from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Loader2, Search, GraduationCap, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { LevelBadge } from '@/components/dashboard/progress-components';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface Student {
  id: string;
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  user: {
    id: string;
    email: string;
    studentName: string;
    parentName?: string;
    avatar?: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
}

export default function StudentsPage() {
  const { user, accessToken } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not teacher
  if (user?.role !== 'TEACHER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Users className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-muted-foreground">Halaman ini hanya untuk guru</p>
      </div>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['myStudents'],
    queryFn: () => graphqlRequest(USER_QUERIES.MY_STUDENTS, undefined, { token: accessToken }),
    enabled: !!accessToken,
  });

  const students: Student[] = data?.myStudents || [];

  // Filter students based on search query
  const filteredStudents = students.filter((student) =>
    student.user.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'text-purple-600';
    if (level >= 7) return 'text-blue-600';
    if (level >= 4) return 'text-green-600';
    return 'text-gray-600';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Mahir';
    if (level >= 4) return 'Menengah';
    return 'Pemula';
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Siswa' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Siswa</h1>
          <p className="text-muted-foreground mt-1">
            {students.length} siswa terdaftar
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama atau email siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
      {!isLoading && !error && students.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada siswa</h3>
          <p className="text-muted-foreground mb-4">
            Siswa yang terdaftar akan muncul di sini
          </p>
          <p className="text-sm text-muted-foreground">
            Tambahkan siswa melalui halaman <Link href="/dashboard/classrooms" className="text-primary hover:underline">Kelas</Link>
          </p>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && !error && students.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil</h3>
          <p className="text-muted-foreground">
            Tidak ditemukan siswa dengan nama &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Student List */}
      {!isLoading && !error && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
            >
              <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar or Initial */}
                      <div className="flex-shrink-0">
                        {student.user.avatar ? (
                          <img
                            src={student.user.avatar}
                            alt={student.user.studentName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {student.user.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {student.user.studentName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.user.email}
                        </p>
                      </div>
                    </div>

                    <LevelBadge level={student.level} size="sm" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Level Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Level</span>
                    </div>
                    <span className={`font-semibold ${getLevelColor(student.level)}`}>
                      {student.level} - {getLevelTitle(student.level)}
                    </span>
                  </div>

                  {/* Total XP */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">Total XP</span>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      {student.totalXP.toLocaleString()}
                    </span>
                  </div>

                  {/* XP Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress ke Level {student.level + 1}</span>
                      <span>{student.currentXP} XP</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        style={{
                          width: `${(student.currentXP / (student.level * 100)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge
                      variant={student.user.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {student.user.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    {student.user.parentName && (
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        Ortu: {student.user.parentName}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Statistics Summary */}
      {!isLoading && !error && students.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {students.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + s.level, 0) / students.length).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {students.reduce((sum, s) => sum + s.totalXP, 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
