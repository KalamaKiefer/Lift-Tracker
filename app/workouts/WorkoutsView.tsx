"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarBlankIcon,
  SquaresFourIcon,
  PlusIcon,
  CaretLeftIcon,
  CaretRightIcon,
  BarbellIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { toDateKey } from "@/utils/calendar";

export type WorkoutItem = {
  id: string;
  title: string;
  completed_at: string;
  exerciseCount: number;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WorkoutsView({ workouts }: { workouts: WorkoutItem[] }) {
  const today = new Date();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const workoutsByDate = useMemo(() => {
    const map: Record<string, WorkoutItem[]> = {};

    for (const workout of workouts) {
      const date = new Date(workout.completed_at);
      const key = toDateKey(date);
      if (!map[key]) map[key] = [];

      map[key].push(workout);
    }

    return map;
  }, [workouts]);

  const calDays = useMemo(() => {
    const firstWeekday = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const slots: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) slots.push(null);
    for (let d = 1; d <= daysInMonth; d++) slots.push(d);
    const trailing = (7 - (slots.length % 7)) % 7;
    for (let i = 0; i < trailing; i++) slots.push(null);
    return slots;
  }, [calYear, calMonth]);

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);

    setSelectedDay(null);
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);

    setSelectedDay(null);
  }

  function toDayKey(day: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedWorkouts = selectedDay
    ? (workoutsByDate[selectedDay] ?? [])
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-ubuntu text-37 text-matteBlack">Workouts</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={clsx(
                "p-2 transition",
                view === "list"
                  ? "bg-green-primary text-creme"
                  : "text-gray-400 hover:text-matteBlack bg-white",
              )}
            >
              <SquaresFourIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setView("calendar")}
              aria-label="Calendar view"
              className={clsx(
                "p-2 transition border-l border-gray-200",
                view === "calendar"
                  ? "bg-green-primary text-creme"
                  : "text-gray-400 hover:text-matteBlack bg-white",
              )}
            >
              <CalendarBlankIcon className="w-5 h-5" />
            </button>
          </div>

          <Link
            href="/workouts/new"
            className="flex items-center gap-2 bg-green-primary text-creme px-4 py-2 rounded-md font-quicksand font-semibold text-16 hover:brightness-110 transition"
          >
            <PlusIcon className="w-4 h-4" weight="bold" />
            New Workout
          </Link>
        </div>
      </div>

      {view === "list" &&
        (workouts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => {
              const date = new Date(workout.completed_at);

              return (
                <Link
                  key={workout.id}
                  href={`/workouts/${workout.id}`}
                  className="flex flex-col p-5 bg-white rounded-xl border border-gray-200 hover:border-green-primary hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-ubuntu text-20 text-matteBlack group-hover:text-green-primary transition leading-snug">
                      {workout.title}
                    </h3>
                    <BarbellIcon className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                  </div>

                  <p className="font-quicksand text-14 text-gray-400">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <p className="font-quicksand text-14 text-gray-600 mt-auto pt-4">
                    {workout.exerciseCount} exercise
                    {workout.exerciseCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        ))}

      {view === "calendar" && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-md text-gray-400 hover:text-matteBlack hover:bg-gray-100 transition"
              aria-label="Previous month"
            >
              <CaretLeftIcon className="w-5 h-5" />
            </button>

            <h2 className="font-ubuntu text-24 text-matteBlack">
              {MONTHS[calMonth]} {calYear}
            </h2>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-md text-gray-400 hover:text-matteBlack hover:bg-gray-100 transition"
              aria-label="Next month"
            >
              <CaretRightIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center font-quicksand text-xs text-gray-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} />;

              const key = toDayKey(day);
              const dayWorkouts = workoutsByDate[key] ?? [];
              const hasWorkout = dayWorkouts.length > 0;
              const isToday =
                today.getFullYear() === calYear &&
                today.getMonth() === calMonth &&
                today.getDate() === day;
              const isSelected = selectedDay === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    hasWorkout && setSelectedDay(isSelected ? null : key)
                  }
                  disabled={!hasWorkout}
                  className={clsx(
                    "relative aspect-square flex items-center justify-center rounded-lg font-quicksand text-14 transition select-none",
                    hasWorkout
                      ? "bg-green-primary text-creme cursor-pointer hover:brightness-110"
                      : isToday
                        ? "border-2 border-green-primary text-green-primary cursor-default"
                        : "text-gray-500 cursor-default",
                    isSelected && "ring-2 ring-offset-1 ring-matteBlack",
                  )}
                >
                  {day}
                  {hasWorkout && dayWorkouts.length > 1 && (
                    <span className="absolute bottom-0.5 right-1 font-bold text-[9px] text-creme/70 leading-none">
                      {dayWorkouts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-primary" />
              <span className="font-quicksand text-xs text-gray-400">
                Workout logged
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-green-primary" />
              <span className="font-quicksand text-xs text-gray-400">
                Today
              </span>
            </div>
          </div>

          {selectedDay && selectedWorkouts.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-ubuntu text-20 text-matteBlack mb-3">
                {new Date(`${selectedDay}T12:00:00`).toLocaleDateString(
                  "en-US",
                  { weekday: "long", month: "long", day: "numeric" },
                )}
              </h3>
              <div className="flex flex-col gap-2">
                {selectedWorkouts.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/${w.id}`}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-green-primary hover:shadow-sm transition group"
                  >
                    <div>
                      <h4 className="font-ubuntu text-18 text-matteBlack group-hover:text-green-primary transition">
                        {w.title}
                      </h4>
                      <p className="font-quicksand text-xs text-gray-400">
                        {w.exerciseCount} exercise
                        {w.exerciseCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <CaretRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-primary transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {workouts.length === 0 && (
            <p className="font-quicksand text-14 text-gray-400 text-center mt-8">
              No workouts logged yet.{" "}
              <Link
                href="/workouts/new"
                className="text-green-primary underline"
              >
                Create one
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BarbellIcon className="w-16 h-16 text-gray-200 mb-5" />
      <h2 className="font-ubuntu text-24 text-matteBlack mb-2">
        No workouts yet
      </h2>
      <p className="font-quicksand text-16 text-gray-500 mb-8 max-w-sm">
        Log your first workout to start tracking your progress and PRs.
      </p>
      <Link
        href="/workouts/new"
        className="bg-green-primary text-creme px-6 py-3 rounded-md font-quicksand font-semibold text-16 hover:brightness-110 transition"
      >
        Create Your First Workout
      </Link>
    </div>
  );
}
