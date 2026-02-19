import React from 'react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-xl',
  };

  // Color based on level tiers
  const getLevelColor = (lvl: number) => {
    if (lvl >= 10) return 'from-purple-500 to-pink-500'; // Master
    if (lvl >= 7) return 'from-blue-500 to-cyan-500'; // Advanced
    if (lvl >= 4) return 'from-green-500 to-emerald-500'; // Intermediate
    return 'from-orange-500 to-yellow-500'; // Beginner
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Badge Circle */}
      <div
        className={cn(
          'rounded-full bg-gradient-to-br shadow-lg flex flex-col items-center justify-center',
          sizeClasses[size],
          getLevelColor(level)
        )}
      >
        <div className="text-white font-bold">LV</div>
        <div className="text-white font-extrabold">{level}</div>
      </div>
    </div>
  );
}

interface XPProgressProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  showLabel?: boolean;
  className?: string;
}

export function XPProgress({ 
  currentXP, 
  xpToNextLevel, 
  level, 
  showLabel = true,
  className 
}: XPProgressProps) {
  const percentage = (currentXP / xpToNextLevel) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">Level {level}</span>
          <span className="text-muted-foreground">
            {currentXP} / {xpToNextLevel} XP
          </span>
        </div>
      )}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface SubjectProgressBarProps {
  subjectName: string;
  completedLessons: number;
  totalLessons: number;
  color?: string;
  icon?: string;
  className?: string;
}

export function SubjectProgressBar({
  subjectName,
  completedLessons,
  totalLessons,
  color = '#3b82f6',
  icon,
  className,
}: SubjectProgressBarProps) {
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium">{subjectName}</span>
        </div>
        <span className="text-muted-foreground">
          {completedLessons} / {totalLessons} lessons
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(1)}% completed
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, description, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
