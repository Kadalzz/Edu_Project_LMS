'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { graphqlRequest, NOTE_QUERIES, NOTE_MUTATIONS, DAILY_REPORT_QUERIES, DAILY_REPORT_MUTATIONS, PROGRESS_QUERIES } from '@/lib/graphql-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MessageSquare, FileText, User, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LevelBadge, XPProgress, SubjectProgressBar, StatsCard } from '@/components/dashboard/progress-components';

type Mood = 'VERY_SAD' | 'SAD' | 'NEUTRAL' | 'HAPPY' | 'VERY_HAPPY';

const MOOD_EMOJIS: Record<Mood, string> = {
  VERY_SAD: '😭',
  SAD: '😟',
  NEUTRAL: '😐',
  HAPPY: '🙂',
  VERY_HAPPY: '😄',
};

const MOOD_LABELS: Record<Mood, string> = {
  VERY_SAD: 'Sangat Sedih',
  SAD: 'Sedih',
  NEUTRAL: 'Biasa',
  HAPPY: 'Senang',
  VERY_HAPPY: 'Sangat Senang',
};

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Daily report state
  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 'NEUTRAL' as Mood,
    activities: [''],
    achievements: '',
    challenges: '',
    notes: '',
  });
  const [commentContent, setCommentContent] = useState('');
  const [commentTo, setCommentTo] = useState<string | null>(null);

  // Fetch notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', studentId],
    queryFn: () => graphqlRequest(NOTE_QUERIES.BY_STUDENT, { studentId }, { token: accessToken }),
    enabled: !!accessToken && !!studentId,
  });

  // Debug: Log notes data
  console.log('📝 Notes Data:', notes);
  console.log('📝 Notes Array:', notes?.notesByStudent);
  console.log('📝 Notes Count:', notes?.notesByStudent?.length);

  // Fetch daily reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['dailyReports', studentId],
    queryFn: () => graphqlRequest(DAILY_REPORT_QUERIES.BY_STUDENT, { studentId }, { token: accessToken }),
    enabled: !!accessToken && !!studentId,
  });

  // Debug: Log reports data
  console.log('📊 Daily Reports Data:', reports);
  console.log('📊 Daily Reports Array:', reports?.dailyReportsByStudent);
  console.log('📊 Daily Reports Count:', reports?.dailyReportsByStudent?.length);

  // Fetch student stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', studentId],
    queryFn: () => graphqlRequest(PROGRESS_QUERIES.STUDENT_STATS, { studentId }, { token: accessToken }),
    enabled: !!accessToken && !!studentId,
  });

  const studentStats = statsData?.studentStats;

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (input: any) => graphqlRequest(NOTE_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', studentId] });
      setNoteContent('');
      setReplyTo(null);
    },
  });

  // Create daily report mutation
  const createReportMutation = useMutation({
    mutationFn: (input: any) => graphqlRequest(DAILY_REPORT_MUTATIONS.CREATE, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyReports', studentId] });
      setReportForm({
        date: new Date().toISOString().split('T')[0],
        mood: 'NEUTRAL',
        activities: [''],
        achievements: '',
        challenges: '',
        notes: '',
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (input: any) => graphqlRequest(DAILY_REPORT_MUTATIONS.ADD_COMMENT, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyReports', studentId] });
      setCommentContent('');
      setCommentTo(null);
      console.log('Comment added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
      alert('Gagal menambahkan komentar: ' + (error?.message || 'Unknown error'));
    },
  });

  const handleCreateNote = () => {
    if (!noteContent.trim()) return;
    createNoteMutation.mutate({
      studentId,
      content: noteContent,
      ...(replyTo && { parentNoteId: replyTo }),
    });
  };

  const handleCreateReport = () => {
    if (!reportForm.activities.some((a) => a.trim())) {
      alert('Minimal 1 aktivitas harus diisi');
      return;
    }
    createReportMutation.mutate({
      studentId,
      date: reportForm.date,
      mood: reportForm.mood,
      activities: reportForm.activities.filter((a) => a.trim()),
      achievements: reportForm.achievements || undefined,
      challenges: reportForm.challenges || undefined,
      notes: reportForm.notes || undefined,
    });
  };

  const handleAddComment = (reportId: string) => {
    if (!commentContent.trim()) {
      alert('Komentar tidak boleh kosong');
      return;
    }
    console.log('Adding comment:', { reportId, content: commentContent });
    addCommentMutation.mutate({
      reportId,
      content: commentContent,
    });
  };

  const addActivity = () => {
    setReportForm({ ...reportForm, activities: [...reportForm.activities, ''] });
  };

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...reportForm.activities];
    newActivities[index] = value;
    setReportForm({ ...reportForm, activities: newActivities });
  };

  const removeActivity = (index: number) => {
    if (reportForm.activities.length === 1) return;
    const newActivities = reportForm.activities.filter((_, i) => i !== index);
    setReportForm({ ...reportForm, activities: newActivities });
  };

  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-8 h-8" />
          Detail Siswa
        </h1>
        <p className="text-muted-foreground mt-1">Lihat profil, catatan, dan laporan harian siswa</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="w-4 h-4 mr-2" />
            Catatan
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Calendar className="w-4 h-4 mr-2" />
            Laporan Harian
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Level & XP Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Level & XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <LevelBadge level={studentStats?.level || 1} size="lg" />
                    <div className="flex-1">
                      <XPProgress
                        currentXP={studentStats?.currentXP || 0}
                        xpToNextLevel={studentStats?.xpToNextLevel || 100}
                        level={studentStats?.level || 1}
                        showLabel={true}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Total XP: <span className="font-semibold">{studentStats?.totalXP || 0}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Tugas Selesai"
                  value={studentStats?.totalAssignmentsCompleted || 0}
                  description={`${studentStats?.totalQuizzesCompleted || 0} quiz, ${studentStats?.totalTasksCompleted || 0} task`}
                />
                <StatsCard
                  title="Rata-rata Nilai"
                  value={studentStats?.averageScore?.toFixed(1) || '0.0'}
                  description="Dari semua tugas"
                />
                <StatsCard
                  title="Level"
                  value={studentStats?.level || 1}
                  description={`${studentStats?.levelProgress?.toFixed(0) || 0}% ke level berikutnya`}
                />
                <StatsCard
                  title="Total XP"
                  value={studentStats?.totalXP || 0}
                  description={`${studentStats?.currentXP || 0} XP di level ini`}
                />
              </div>

              {/* Subject Progress */}
              {studentStats?.subjectProgress && studentStats.subjectProgress.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progress per Mata Pelajaran</CardTitle>
                  </CardHeader>
                  <CardContent>
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
            </>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* Create Note Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {replyTo ? 'Balas Catatan' : 'Tulis Catatan Baru'}
              </CardTitle>
              {replyTo && (
                <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                  Batal Balas
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Tulis catatan untuk siswa..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
              <Button onClick={handleCreateNote} disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? 'Mengirim...' : 'Kirim Catatan'}
              </Button>
            </CardContent>
          </Card>

          {/* Notes List */}
          <div className="space-y-4">
            {notesLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Memuat catatan...</p>
                </CardContent>
              </Card>
            ) : notes?.notesByStudent?.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Belum ada catatan</p>
                </CardContent>
              </Card>
            ) : (
              notes?.notesByStudent?.map((note: any) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-medium">
                          {note.writtenBy.name}
                        </CardTitle>
                        <CardDescription>
                          {note.writtenBy.role === 'TEACHER' ? '👨‍🏫 Guru' : '👨‍👩‍👧 Orang Tua'} •{' '}
                          {new Date(note.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{note.content}</p>

                    {/* Replies */}
                    {note.replies && note.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 pl-4">
                        {note.replies.map((reply: any) => (
                          <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{reply.writtenBy.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {reply.writtenBy.role === 'TEACHER' ? 'Guru' : 'Orang Tua'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(note.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Balas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Daily Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Create Report Form (Teacher Only) */}
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle>Buat Laporan Harian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={reportForm.date}
                      onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mood Siswa</Label>
                    <Select
                      value={reportForm.mood}
                      onValueChange={(value: Mood) => setReportForm({ ...reportForm, mood: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(MOOD_EMOJIS) as Mood[]).map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {MOOD_EMOJIS[mood]} {MOOD_LABELS[mood]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Aktivitas Hari Ini</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                      + Tambah
                    </Button>
                  </div>
                  {reportForm.activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Contoh: Belajar mengenal angka 1-10"
                        value={activity}
                        onChange={(e) => updateActivity(index, e.target.value)}
                      />
                      {reportForm.activities.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Pencapaian (Opsional)</Label>
                  <Textarea
                    placeholder="Apa yang berhasil dicapai siswa hari ini?"
                    value={reportForm.achievements}
                    onChange={(e) => setReportForm({ ...reportForm, achievements: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tantangan (Opsional)</Label>
                  <Textarea
                    placeholder="Kesulitan yang dihadapi siswa hari ini?"
                    value={reportForm.challenges}
                    onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    placeholder="Catatan lainnya untuk orang tua"
                    value={reportForm.notes}
                    onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <Button onClick={handleCreateReport} disabled={createReportMutation.isPending}>
                  {createReportMutation.isPending ? 'Membuat...' : 'Buat Laporan'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reports List */}
          <div className="space-y-4">
            {reportsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Memuat laporan...</p>
                </CardContent>
              </Card>
            ) : reports?.dailyReportsByStudent?.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Belum ada laporan harian</p>
                </CardContent>
              </Card>
            ) : (
              reports?.dailyReportsByStudent?.map((report: any) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {new Date(report.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </CardTitle>
                        <CardDescription>
                          Dibuat oleh {report.createdBy.name}
                        </CardDescription>
                      </div>
                      <div className="text-3xl">{MOOD_EMOJIS[report.mood as Mood]}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Aktivitas:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {report.activities.map((activity: string, i: number) => (
                          <li key={i} className="text-sm">{activity}</li>
                        ))}
                      </ul>
                    </div>

                    {report.achievements && (
                      <div>
                        <h4 className="font-semibold mb-1">Pencapaian:</h4>
                        <p className="text-sm text-muted-foreground">{report.achievements}</p>
                      </div>
                    )}

                    {report.challenges && (
                      <div>
                        <h4 className="font-semibold mb-1">Tantangan:</h4>
                        <p className="text-sm text-muted-foreground">{report.challenges}</p>
                      </div>
                    )}

                    {report.notes && (
                      <div>
                        <h4 className="font-semibold mb-1">Catatan:</h4>
                        <p className="text-sm text-muted-foreground">{report.notes}</p>
                      </div>
                    )}

                    {/* Comments */}
                    {report.comments && report.comments.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3">Komentar:</h4>
                        <div className="space-y-2">
                          {report.comments.map((comment: any) => (
                            <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{comment.commentedBy.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Comment */}
                    {commentTo === report.id ? (
                      <div className="border-t pt-4 space-y-2">
                        <Textarea
                          placeholder="Tulis komentar..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(report.id)}
                            disabled={addCommentMutation.isPending}
                          >
                            {addCommentMutation.isPending ? 'Mengirim...' : 'Kirim'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCommentTo(null);
                              setCommentContent('');
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentTo(report.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Tambah Komentar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
