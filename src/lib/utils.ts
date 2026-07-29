export function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', opts);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export function initials(name: string | null): string {
  if (!name) return 'U';
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export function getWeekStart(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day;
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

export function levelFromHours(hours: number): number {
  return Math.floor(hours / 10) + 1;
}

export function progressInLevel(hours: number): number {
  return (hours % 10) * 10;
}

export function categoryColor(category: string | null): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    'Food Bank': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    'Clean Up': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Shelter': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    'Library': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    'Environment': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'Elder Care': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    'Animals': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    'Education': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  };
  return map[category ?? ''] ?? { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' };
}
