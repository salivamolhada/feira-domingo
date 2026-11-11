/**
 * Date utility helpers for confectionery management
 */

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatToDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSundayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = parseLocalDate(dateStr);
  return date.getDay() === 0;
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
  const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const isSunday = date.getDay() === 0;
  return `${isSunday ? '⭐ Dom' : dayName}, ${dayMonth}`;
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getSundaysOfMonth(year: number, monthZeroIndexed: number): string[] {
  const sundays: string[] = [];
  const date = new Date(year, monthZeroIndexed, 1);
  while (date.getMonth() === monthZeroIndexed) {
    if (date.getDay() === 0) {
      sundays.push(formatToDateInput(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

export function getNearestSunday(targetDate: Date = new Date(), direction: 'next' | 'last' | 'closest' = 'closest'): string {
  const current = new Date(targetDate);
  current.setHours(0, 0, 0, 0);
  const dayOfWeek = current.getDay(); // 0 is Sunday

  if (direction === 'closest') {
    if (dayOfWeek === 0) return formatToDateInput(current);
    const daysUntilNext = 7 - dayOfWeek;
    const daysFromLast = dayOfWeek;
    const offset = daysUntilNext <= daysFromLast ? daysUntilNext : -daysFromLast;
    const res = new Date(current);
    res.setDate(current.getDate() + offset);
    return formatToDateInput(res);
  } else if (direction === 'next') {
    const daysUntilNext = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const res = new Date(current);
    res.setDate(current.getDate() + daysUntilNext);
    return formatToDateInput(res);
  } else {
    // last
    const daysFromLast = dayOfWeek === 0 ? 7 : dayOfWeek;
    const res = new Date(current);
    res.setDate(current.getDate() - daysFromLast);
    return formatToDateInput(res);
  }
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  const name = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}
