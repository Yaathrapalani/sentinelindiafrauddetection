/**
 * Utility functions for Sentinel India
 */

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateAnonymousId(): string {
  return `anon_${crypto.randomUUID()}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'text-success',
    moderate: 'text-accent',
    elevated: 'text-warning',
    high: 'text-destructive',
    critical: 'text-destructive',
  };
  return colors[level] || 'text-muted-foreground';
}

export function getRiskBgColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'bg-success/10 border-success/30',
    moderate: 'bg-accent/10 border-accent/30',
    elevated: 'bg-warning/10 border-warning/30',
    high: 'bg-destructive/10 border-destructive/30',
    critical: 'bg-destructive/20 border-destructive/40',
  };
  return colors[level] || 'bg-muted border-border';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
