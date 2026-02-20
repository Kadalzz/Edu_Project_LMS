'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  Star,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Kelas', href: '/dashboard/classrooms', icon: GraduationCap },
  { label: 'Siswa', href: '/dashboard/students', icon: Users },
  { label: 'Penilaian Tertunda', href: '/dashboard/submissions/pending', icon: ClipboardList },
  { label: 'Media Library', href: '/dashboard/media-test', icon: FileText },
  // TODO: Create these pages before re-enabling (see BUG-REPORT-DAY1-9.md)
  // { label: 'Materi', href: '/dashboard/modules', icon: BookOpen },
  // { label: 'Tugas', href: '/dashboard/assignments', icon: ClipboardList },
  // { label: 'Laporan Harian', href: '/dashboard/daily-reports', icon: FileText },
  // { label: 'Progress', href: '/dashboard/progress', icon: BarChart3 },
  // { label: 'Catatan', href: '/dashboard/notes', icon: MessageSquare },
  // { label: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tugas', href: '/dashboard/assignments', icon: ClipboardList },
  { label: 'Nilai', href: '/dashboard/grades', icon: BarChart3 },
  // TODO: Create these pages before re-enabling (see BUG-REPORT-DAY1-9.md)
  // { label: 'Pelajaran', href: '/dashboard/lessons', icon: BookOpen },
  // { label: 'XP & Level', href: '/dashboard/xp', icon: Star },
  // { label: 'Catatan', href: '/dashboard/notes', icon: MessageSquare },
];

const parentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  // TODO: Create these pages before re-enabling (see BUG-REPORT-DAY1-9.md)
  // { label: 'Progress Anak', href: '/dashboard/progress', icon: BarChart3 },
  // { label: 'Laporan Harian', href: '/dashboard/daily-reports', icon: FileText },
  // { label: 'Catatan', href: '/dashboard/notes', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, viewMode } = useAuthStore();

  let navItems: NavItem[];
  if (user?.role === 'TEACHER') {
    navItems = teacherNavItems;
  } else if (viewMode === 'parent') {
    navItems = parentNavItems;
  } else {
    navItems = studentNavItems;
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:top-16 bg-white border-r">
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* XP Progress for students */}
      {user?.role === 'STUDENT_PARENT' && viewMode === 'student' && (
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">Level & XP</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selesaikan tugas untuk mendapatkan XP!
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
