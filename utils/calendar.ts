/**
 * Returns a flat array of day slots for a monthly calendar grid.
 * Leading/trailing nulls pad the first and last rows to fill weeks.
 */
export function buildCalendarSlots(
  year: number,
  month: number,
): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: (number | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) slots.push(null);
  for (let d = 1; d <= daysInMonth; d++) slots.push(d);

  const trailing = (7 - (slots.length % 7)) % 7;

  for (let i = 0; i < trailing; i++) slots.push(null);

  return slots;
}

/** Formats a Date to "YYYY-MM-DD" using local time. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Groups an array of objects by local date derived from their completed_at field. */
export function groupByDate<T extends { completed_at: string }>(
  items: T[],
): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of items) {
    const key = toDateKey(new Date(item.completed_at));
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}
