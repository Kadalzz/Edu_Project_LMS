'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore, ViewMode } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut, User, BookOpen, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const router = useRouter();
  const { user, viewMode, setViewMode, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.role === 'TEACHER'
    ? user.teacherName || 'Guru'
    : viewMode === 'parent'
      ? user?.parentName || 'Orang Tua'
      : user?.studentName || 'Siswa';

  const roleLabel = user?.role === 'TEACHER'
    ? 'Guru'
    : viewMode === 'parent'
      ? 'Mode Orang Tua'
      : 'Mode Siswa';

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Logo & Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:block">LMS ABK</span>
          </div>
        </div>

        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Role Switch Toggle (only for STUDENT_PARENT) */}
          {user?.role === 'STUDENT_PARENT' && (
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('student')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  viewMode === 'student'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Siswa
              </button>
              <button
                onClick={() => setViewMode('parent')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  viewMode === 'parent'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orang Tua
              </button>
            </div>
          )}

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground leading-tight">{roleLabel}</span>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Role Switch */}
      {user?.role === 'STUDENT_PARENT' && mobileMenuOpen && (
        <div className="sm:hidden border-t p-3 bg-gray-50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Ganti Mode:</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setViewMode('student'); setMobileMenuOpen(false); }}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'student'
                  ? 'bg-primary text-white'
                  : 'bg-white border text-gray-700'
              }`}
            >
              Mode Siswa
            </button>
            <button
              onClick={() => { setViewMode('parent'); setMobileMenuOpen(false); }}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'parent'
                  ? 'bg-primary text-white'
                  : 'bg-white border text-gray-700'
              }`}
            >
              Mode Orang Tua
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
