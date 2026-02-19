'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { UserCircle, Users } from 'lucide-react';

export function RoleSwitcher() {
  const { user, viewMode, setViewMode } = useAuthStore();

  // Only show for STUDENT_PARENT users
  if (user?.role !== 'STUDENT_PARENT') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={viewMode === 'student' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('student')}
        className="gap-2"
      >
        <UserCircle className="h-4 w-4" />
        Siswa
      </Button>
      <Button
        variant={viewMode === 'parent' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('parent')}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        Orang Tua
      </Button>
    </div>
  );
}
