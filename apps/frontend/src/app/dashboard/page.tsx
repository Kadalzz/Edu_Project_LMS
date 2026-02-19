'use client';

import { useAuthStore } from '@/lib/auth-store';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent-dashboard';
import { RoleSwitcher } from '@/components/dashboard/role-switcher';

export default function DashboardPage() {
  const { user, viewMode } = useAuthStore();

  if (!user) return null;

  if (user.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  // STUDENT_PARENT - show role switcher and appropriate dashboard
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <RoleSwitcher />
      </div>
      {viewMode === 'parent' ? <ParentDashboard /> : <StudentDashboard />}
    </div>
  );
}
