export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Subject {
  subjectId: string;
  subjectName: string;
  color: string;
  icon: string;
  semester: string;
  teacherName: string;
  targetGrade: number;
  weight: number; // credit units / subject weight (default 3)
  createdAt: number;
  userId: string;
}

export type AssignmentType = 'quiz' | 'homework' | 'project' | 'exam' | 'activity' | 'lab' | 'presentation';
export type AssignmentStatus = 'pending' | 'in-progress' | 'submitted' | 'graded' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';

export interface Assignment {
  assignmentId: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  type: AssignmentType;
  dueDate: string;
  dueTime: string;
  status: AssignmentStatus;
  scoreEarned?: number;
  totalScore?: number;
  notes: string;
  priority: Priority;
  estimatedTime: number;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface Attachment {
  uploadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  publicId: string;
  createdAt: number;
}

export interface Upload {
  uploadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  publicId: string;
  assignmentId?: string;
  createdAt: number;
  userId: string;
}

export interface Reminder {
  reminderId: string;
  assignmentId: string;
  assignmentTitle: string;
  dueDate: string;
  reminderTime: number;
  sent: boolean;
  userId: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'pending' | 'failed';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'subjects' | 'assignments' | 'uploads';
  data: any;
  timestamp: number;
}

export interface GradeStats {
  subjectId: string;
  subjectName: string;
  color: string;
  average: number;
  assignments: number;
  graded: number;
}

// ---- PRESETS ----
export interface SubjectPresetEntry {
  subjectName: string;
  icon: string;
  color: string;
  weight: number;
  targetGrade: number;
}

export interface GradePreset {
  presetId: string;
  name: string;
  description: string;
  schoolType: string; // 'college' | 'shs' | 'jhs' | 'custom'
  subjects: SubjectPresetEntry[];
  createdAt: number;
  userId: string;
  shareCode: string; // base64 encoded for sharing
}

// ---- COMMUNITY HELP BOARD ----
export interface HelpPost {
  postId: string;
  title: string;
  body: string;
  schoolTag: string;
  subjectTag: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  replyCount: number;
  upvotes: number;
  upvotedBy: string[]; // array of userIds
}

export interface HelpReply {
  replyId: string;
  postId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  upvotes: number;
  upvotedBy: string[];
  isResolved?: boolean;
}

// ---- USER PROFILE ----
export interface UserProfile {
  uid: string;
  displayName: string;
  bio: string;
  school: string;
  course: string;
  yearLevel: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerGradient: string;
  avatarBg: string;
  isPublic: boolean;
  shareId: string;
  createdAt: number;
  updatedAt: number;
}

// ---- CONSTANTS ----

export const SUBJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#14b8a6', '#f97316',
];

export const SUBJECT_ICONS = [
  '📚', '🔬', '🧮', '🌍', '🎨', '💻', '📝', '🔭', '🎭', '🏛️',
  '⚗️', '📐', '🎵', '💡', '🌱', '🏆', '📊', '🔐', '🧠', '✏️',
];

export const ASSIGNMENT_TYPES: { value: AssignmentType; label: string; icon: string }[] = [
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'homework', label: 'Homework', icon: '📝' },
  { value: 'project', label: 'Project', icon: '🏗️' },
  { value: 'exam', label: 'Exam', icon: '📋' },
  { value: 'activity', label: 'Activity', icon: '✏️' },
  { value: 'lab', label: 'Lab', icon: '🔬' },
  { value: 'presentation', label: 'Presentation', icon: '🎤' },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', dot: 'bg-green-500' },
};

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-white/10' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  submitted: { label: 'Submitted', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  graded: { label: 'Graded', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  overdue: { label: 'Overdue', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export const SCHOOL_TYPES = [
  { value: 'college', label: '🎓 College / University' },
  { value: 'shs', label: '📘 Senior High School (SHS)' },
  { value: 'jhs', label: '📗 Junior High School (JHS)' },
  { value: 'custom', label: '✏️ Custom' },
];

// Schools - manually curated list for PH
export const PHILIPPINE_SCHOOLS: string[] = [
  'University of the Philippines (UP)',
  'Ateneo de Manila University',
  'De La Salle University (DLSU)',
  'University of Santo Tomas (UST)',
  'Far Eastern University (FEU)',
  'Polytechnic University of the Philippines (PUP)',
  'Mapúa University',
  'Pamantasan ng Lungsod ng Maynila (PLM)',
  'University of the East (UE)',
  'National University (NU)',
  'San Beda University',
  'Miriam College',
  'Adamson University',
  'Lyceum of the Philippines University',
  'Philippine Normal University (PNU)',
  'Technological University of the Philippines (TUP)',
  'Saint Louis University (SLU)',
  'University of San Carlos (USC)',
  'Cebu Normal University',
  'Mindanao State University (MSU)',
  'Other / Not Listed',
];

export const PRESET_TEMPLATES: Omit<GradePreset, 'presetId' | 'userId' | 'createdAt' | 'shareCode'>[] = [
  {
    name: 'BS Computer Science (Year 1)',
    description: 'Typical 1st year CS curriculum in PH universities',
    schoolType: 'college',
    subjects: [
      { subjectName: 'Programming 1', icon: '💻', color: '#6366f1', weight: 3, targetGrade: 85 },
      { subjectName: 'Discrete Mathematics', icon: '🧮', color: '#8b5cf6', weight: 3, targetGrade: 80 },
      { subjectName: 'Computer Organization', icon: '🔐', color: '#3b82f6', weight: 3, targetGrade: 80 },
      { subjectName: 'Komunikasyon sa Filipino', icon: '📝', color: '#10b981', weight: 3, targetGrade: 85 },
      { subjectName: 'Purposive Communication', icon: '🎭', color: '#f59e0b', weight: 3, targetGrade: 85 },
      { subjectName: 'NSTP', icon: '🏆', color: '#06b6d4', weight: 3, targetGrade: 90 },
    ],
  },
  {
    name: 'SHS - STEM (Grade 11)',
    description: 'Standard STEM strand subjects',
    schoolType: 'shs',
    subjects: [
      { subjectName: 'Pre-Calculus', icon: '🧮', color: '#6366f1', weight: 4, targetGrade: 85 },
      { subjectName: 'Earth Science', icon: '🌍', color: '#10b981', weight: 4, targetGrade: 85 },
      { subjectName: 'General Biology 1', icon: '🔬', color: '#ec4899', weight: 4, targetGrade: 85 },
      { subjectName: 'General Physics 1', icon: '🔭', color: '#3b82f6', weight: 4, targetGrade: 80 },
      { subjectName: 'General Chemistry 1', icon: '⚗️', color: '#f59e0b', weight: 4, targetGrade: 80 },
      { subjectName: 'Oral Communication', icon: '🎤', color: '#8b5cf6', weight: 2, targetGrade: 90 },
    ],
  },
  {
    name: 'SHS - ABM (Grade 11)',
    description: 'Accountancy, Business & Management strand',
    schoolType: 'shs',
    subjects: [
      { subjectName: 'Business Math', icon: '🧮', color: '#6366f1', weight: 4, targetGrade: 85 },
      { subjectName: 'Organization & Management', icon: '🏛️', color: '#8b5cf6', weight: 4, targetGrade: 85 },
      { subjectName: 'Business Ethics', icon: '📚', color: '#10b981', weight: 4, targetGrade: 90 },
      { subjectName: 'Fundamentals of ABM', icon: '📊', color: '#f59e0b', weight: 4, targetGrade: 85 },
      { subjectName: 'Oral Communication', icon: '🎤', color: '#ec4899', weight: 2, targetGrade: 90 },
      { subjectName: 'Humanities & Social Sciences', icon: '🌍', color: '#06b6d4', weight: 4, targetGrade: 88 },
    ],
  },
];
