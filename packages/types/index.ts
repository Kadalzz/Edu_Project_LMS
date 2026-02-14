// Common types shared across frontend and backend

export type ViewMode = 'student' | 'parent';

export interface CurrentUser {
  id: string;
  email: string;
  role: 'TEACHER' | 'STUDENT_PARENT';
  studentName?: string;
  parentName?: string;
  teacherName?: string;
  avatar?: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  level: number;
  totalXP: number;
  currentXP: number;
  nextLevelXP: number;
  completionRate: number;
}

export interface LevelInfo {
  level: number;
  minXP: number;
  maxXP: number;
  label: string;
}

// XP system
export const XP_PER_LEVEL = 100;
export const QUIZ_XP = 10;
export const TASK_ANALYSIS_XP = 20;

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function calculateCurrentXP(totalXP: number): number {
  return totalXP % XP_PER_LEVEL;
}

export function getNextLevelXP(): number {
  return XP_PER_LEVEL;
}

export function getLevelInfo(level: number): LevelInfo {
  const minXP = (level - 1) * XP_PER_LEVEL;
  const maxXP = level * XP_PER_LEVEL;
  
  let label = '';
  if (level === 1) label = 'Pemula';
  else if (level <= 5) label = 'Pelajar';
  else if (level <= 10) label = 'Mahir';
  else label = 'Ahli';
  
  return { level, minXP, maxXP, label };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateStudentForm {
  email: string;
  studentName: string;
  parentName?: string;
  password: string;
}

export interface CreateLessonForm {
  title: string;
  description?: string;
  content?: string;
  moduleId: string;
  isDraft: boolean;
}

export interface CreateQuizForm {
  title: string;
  description?: string;
  lessonId: string;
  dueDate?: Date;
  questions: QuizQuestionForm[];
}

export interface QuizQuestionForm {
  question: string;
  questionImage?: string;
  options: {
    key: string; // A, B, C, D
    text: string;
    image?: string;
    isCorrect: boolean;
  }[];
}

export interface CreateTaskAnalysisForm {
  title: string;
  description?: string;
  lessonId: string;
  dueDate?: Date;
  steps: TaskStepForm[];
}

export interface TaskStepForm {
  stepNumber: number;
  instruction: string;
  referenceImage?: string;
  isMandatory: boolean;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Notification types
export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  variant: NotificationVariant;
  duration?: number;
}
