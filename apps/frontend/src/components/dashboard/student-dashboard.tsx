'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ClipboardList, Star, Trophy } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Halo, {user?.studentName || 'Siswa'}! 🌟
        </h1>
        <p className="text-muted-foreground mt-1">
          Ayo belajar dan kumpulkan XP!
        </p>
      </div>

      {/* XP & Level Card */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-6 w-6" />
              <span className="text-lg font-bold">Level 1 - Pemula</span>
            </div>
            <p className="text-white/80 text-sm">0 / 100 XP untuk naik level</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">0</p>
            <p className="text-white/80 text-sm">Total XP</p>
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="mt-4 bg-white/30 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Pelajaran"
          description="Mulai belajar materi baru"
          icon={BookOpen}
          color="blue"
          href="/dashboard/lessons"
        />
        <QuickActionCard
          title="Tugas"
          description="Kerjakan tugas dari guru"
          icon={ClipboardList}
          color="green"
          href="/dashboard/assignments"
        />
        <QuickActionCard
          title="XP & Level"
          description="Lihat progress XP kamu"
          icon={Star}
          color="yellow"
          href="/dashboard/xp"
        />
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow';
  href: string;
}

const actionColorClasses = {
  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  green: 'bg-green-50 border-green-200 hover:bg-green-100',
  yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
};

function QuickActionCard({ title, description, icon: Icon, color }: QuickActionCardProps) {
  return (
    <Card className={`cursor-pointer transition-colors border-2 ${actionColorClasses[color]}`}>
      <CardContent className="p-6">
        <Icon className={`h-8 w-8 mb-3 ${iconColorClasses[color]}`} />
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
