import {
  buildCalendarSlots,
  toDateKey,
  groupByDate,
} from "@/utils/calendar";

describe("buildCalendarSlots", () => {
  it("produces leading nulls equal to the first weekday index", () => {
    // January 2026 starts on Thursday (weekday index 4)
    const slots = buildCalendarSlots(2026, 0);
    expect(slots.slice(0, 4)).toEqual([null, null, null, null]);
    expect(slots[4]).toBe(1);
  });

  it("contains all days of the month in order", () => {
    const slots = buildCalendarSlots(2026, 0); // January — 31 days
    const days = slots.filter((s): s is number => s !== null);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe(1);
    expect(days[days.length - 1]).toBe(31);
  });

  it("total length is always a multiple of 7 for every month", () => {
    for (let month = 0; month < 12; month++) {
      const slots = buildCalendarSlots(2026, month);
      expect(slots.length % 7).toBe(0);
    }
  });

  it("handles February in a leap year (29 days)", () => {
    const slots = buildCalendarSlots(2024, 1);
    const days = slots.filter((s): s is number => s !== null);
    expect(days).toHaveLength(29);
    expect(days[days.length - 1]).toBe(29);
  });

  it("handles February in a non-leap year (28 days)", () => {
    const slots = buildCalendarSlots(2025, 1);
    const days = slots.filter((s): s is number => s !== null);
    expect(days).toHaveLength(28);
    expect(days[days.length - 1]).toBe(28);
  });

  it("produces no leading nulls when the month starts on Sunday", () => {
    // March 2026 starts on Sunday (weekday index 0)
    const slots = buildCalendarSlots(2026, 2);
    expect(slots[0]).toBe(1);
  });

  it("produces six leading nulls when the month starts on Saturday", () => {
    // August 2026 starts on Saturday (weekday index 6)
    const slots = buildCalendarSlots(2026, 7);
    expect(slots.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(slots[6]).toBe(1);
  });

  it("pads trailing nulls so final row is complete", () => {
    // Any month: last row must be full 7 cells
    const slots = buildCalendarSlots(2026, 3); // April 2026
    const lastRowStart = slots.length - 7;
    const lastRow = slots.slice(lastRowStart);
    expect(lastRow).toHaveLength(7);
  });
});

describe("toDateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    // new Date(year, monthIndex, day) uses local time
    expect(toDateKey(new Date(2026, 3, 24))).toBe("2026-04-24");
  });

  it("zero-pads single-digit months and days", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("handles December (month 11)", () => {
    expect(toDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("handles the first day of the year", () => {
    expect(toDateKey(new Date(2025, 0, 1))).toBe("2025-01-01");
  });
});

describe("groupByDate", () => {
  it("returns an empty object for an empty array", () => {
    expect(groupByDate([])).toEqual({});
  });

  it("groups multiple items on the same day under one key", () => {
    const items = [
      { id: "1", completed_at: "2026-04-20T08:00:00" },
      { id: "2", completed_at: "2026-04-20T17:00:00" },
    ];
    const result = groupByDate(items);
    const key = toDateKey(new Date("2026-04-20T08:00:00"));
    expect(result[key]).toHaveLength(2);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("creates separate keys for different days", () => {
    const items = [
      { id: "1", completed_at: "2026-04-20T10:00:00" },
      { id: "2", completed_at: "2026-04-21T10:00:00" },
      { id: "3", completed_at: "2026-04-21T15:00:00" },
    ];
    const result = groupByDate(items);
    expect(Object.keys(result)).toHaveLength(2);
  });

  it("preserves all original items across all groups", () => {
    const items = [
      { id: "1", completed_at: "2026-01-01T00:00:00" },
      { id: "2", completed_at: "2026-06-15T12:00:00" },
      { id: "3", completed_at: "2026-12-31T23:59:00" },
    ];
    const result = groupByDate(items);
    const allItems = Object.values(result).flat();
    expect(allItems).toHaveLength(3);
  });
});
