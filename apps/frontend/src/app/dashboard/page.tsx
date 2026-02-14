'use client';

import { useAuthStore } from '@/lib/auth-store';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';

export default function DashboardPage() {
  const { user, viewMode } = useAuthStore();

  if (!user) return null;

  if (user.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  // STUDENT_PARENT - show based on view mode
  if (viewMode === 'parent') {
    return <ParentDashboard />;
  }

  return <StudentDashboard />;
}

function ParentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Orang Tua</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Progress Anak</h3>
          <p className="text-muted-foreground text-sm">
            Lihat perkembangan belajar anak Anda
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Catatan Harian</h3>
          <p className="text-muted-foreground text-sm">
            Baca laporan harian dari guru
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Komunikasi</h3>
          <p className="text-muted-foreground text-sm">
            Catatan dan pesan dari guru
          </p>
        </div>
      </div>
    </div>
  );
}
