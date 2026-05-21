import { format, isToday, isTomorrow, isPast, differenceInDays, parseISO } from 'date-fns';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDueDate(dateStr: string, timeStr?: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today${timeStr ? ` at ${timeStr}` : ''}`;
    if (isTomorrow(date)) return `Tomorrow${timeStr ? ` at ${timeStr}` : ''}`;
    const diff = differenceInDays(date, new Date());
    if (diff > 0 && diff <= 7) return `In ${diff} day${diff > 1 ? 's' : ''}`;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function isOverdue(dateStr: string, timeStr?: string): boolean {
  try {
    const dateTime = new Date(`${dateStr}T${timeStr || '23:59'}`);
    return isPast(dateTime);
  } catch {
    return false;
  }
}

export function calculateGPA(scores: { earned: number; total: number }[]): number {
  if (scores.length === 0) return 0;
  const totalEarned = scores.reduce((sum, s) => sum + s.earned, 0);
  const totalPossible = scores.reduce((sum, s) => sum + s.total, 0);
  if (totalPossible === 0) return 0;
  const percentage = (totalEarned / totalPossible) * 100;
  return percentageToGPA(percentage);
}

export function percentageToGPA(percentage: number): number {
  if (percentage >= 97) return 4.0;
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 67) return 1.3;
  if (percentage >= 65) return 1.0;
  return 0.0;
}

export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
}

export function getDaysUntilDue(dateStr: string): number {
  try {
    return differenceInDays(parseISO(dateStr), new Date());
  } catch {
    return 0;
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function colorWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function sortByDueDate(a: { dueDate: string }, b: { dueDate: string }): number {
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, body: string, icon?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: icon || '/icons/icon-192x192.png' });
  }
}
