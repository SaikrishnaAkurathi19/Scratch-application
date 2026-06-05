export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function fromUnix(unix: number): Date {
  return new Date(unix * 1000);
}

export function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toUnix(d);
}

export function todayEnd(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return toUnix(d);
}

export function tomorrowStart(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return toUnix(d);
}

export function tomorrowEnd(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 59, 999);
  return toUnix(d);
}

export function nextWeekEnd(): number {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return toUnix(d);
}

export function isOverdue(dueDate: number | null): boolean {
  if (!dueDate) return false;
  return dueDate < todayStart();
}

export function isDueToday(dueDate: number | null): boolean {
  if (!dueDate) return false;
  return dueDate >= todayStart() && dueDate <= todayEnd();
}

export function formatDate(unix: number | null): string {
  if (!unix) return '';
  const date = fromUnix(unix);
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(unix: number | null): string {
  if (!unix) return '';
  return fromUnix(unix).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function formatDateTime(unix: number | null): string {
  if (!unix) return '';
  return `${formatDate(unix)} at ${formatTime(unix)}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function quickDateToUnix(option: 'Today' | 'Tomorrow' | 'Next Week'): number {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  if (option === 'Tomorrow') d.setDate(d.getDate() + 1);
  if (option === 'Next Week') d.setDate(d.getDate() + 7);
  return toUnix(d);
}

export function daysAgo(isoDate: string): number {
  const then = new Date(isoDate).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
