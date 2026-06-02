"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PlusIcon,
  XIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createWorkout } from "./actions";

export type LibraryExercise = {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string;
};

type SetDraft = {
  reps: string;
  weight_kg: string;
};

type ExerciseDraft = {
  uid: string;
  library_id: string | null;
  custom_name: string | null;
  displayName: string;
  equipment: string;
  sets: SetDraft[];
};

type QuickFillDraft = { sets: string; reps: string; weight: string };

export function WorkoutBuilder({
  exercises: library,
}: {
  exercises: LibraryExercise[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("New Workout");
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [quickFillOpen, setQuickFillOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [quickFillDraft, setQuickFillDraft] = useState<
    Record<string, QuickFillDraft>
  >({});

  const filteredLibrary = searchQuery
    ? library.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : library;

  function addLibraryExercise(libEx: LibraryExercise) {
    setExercises((prev) => [
      ...prev,
      {
        uid: crypto.randomUUID(),
        library_id: libEx.id,
        custom_name: null,
        displayName: libEx.name,
        equipment: libEx.equipment,
        sets: [{ reps: "", weight_kg: "" }],
      },
    ]);
    setSearchQuery("");
    setShowSearch(false);
  }

  function addCustomExercise() {
    const name = searchQuery.trim();
    if (!name) return;
    setExercises((prev) => [
      ...prev,
      {
        uid: crypto.randomUUID(),
        library_id: null,
        custom_name: name,
        displayName: name,
        equipment: "other",
        sets: [{ reps: "", weight_kg: "" }],
      },
    ]);
    setSearchQuery("");
    setShowSearch(false);
  }

  function removeExercise(uid: string) {
    setExercises((prev) => prev.filter((e) => e.uid !== uid));
  }

  function addSet(uid: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.uid === uid
          ? { ...e, sets: [...e.sets, { reps: "", weight_kg: "" }] }
          : e,
      ),
    );
  }

  function removeSet(uid: string, setIdx: number) {
    setExercises((prev) =>
      prev.map((e) =>
        e.uid === uid
          ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx) }
          : e,
      ),
    );
  }

  function updateSet(
    uid: string,
    setIdx: number,
    field: keyof SetDraft,
    value: string,
  ) {
    setExercises((prev) =>
      prev.map((e) =>
        e.uid === uid
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === setIdx ? { ...s, [field]: value } : s,
              ),
            }
          : e,
      ),
    );
  }

  function openQuickFill(uid: string) {
    setQuickFillOpen((prev) => ({ ...prev, [uid]: true }));
    setQuickFillDraft((prev) => ({
      ...prev,
      [uid]: prev[uid] ?? { sets: "", reps: "", weight: "" },
    }));
  }

  function closeQuickFill(uid: string) {
    setQuickFillOpen((prev) => ({ ...prev, [uid]: false }));
  }

  function updateQuickFill(
    uid: string,
    field: keyof QuickFillDraft,
    value: string,
  ) {
    setQuickFillDraft((prev) => ({
      ...prev,
      [uid]: {
        ...(prev[uid] ?? { sets: "", reps: "", weight: "" }),
        [field]: value,
      },
    }));
  }

  function applyQuickFill(uid: string) {
    const draft = quickFillDraft[uid];
    if (!draft) return;

    const count = parseInt(draft.sets, 10);

    if (!count || count < 1 || count > 20) {
      toast.error("Sets must be between 1 and 20.");
      return;
    }

    const newSets: SetDraft[] = Array.from({ length: count }, () => ({
      reps: draft.reps,
      weight_kg: draft.weight,
    }));

    setExercises((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, sets: newSets } : e)),
    );

    closeQuickFill(uid);
  }

  function handleFinish() {
    if (!exercises.length) {
      toast.error("Add at least one exercise before finishing.");
      return;
    }

    startTransition(async () => {
      const result = await createWorkout({
        title: title.trim() || "Workout",
        notes: "",
        exercises: exercises.map((ex, orderIdx) => ({
          library_id: ex.library_id,
          custom_name: ex.custom_name,
          order_index: orderIdx,
          sets: ex.sets
            .map((s, setIdx) => ({
              set_index: setIdx,
              reps: s.reps !== "" ? parseInt(s.reps, 10) : null,
              weight_kg: s.weight_kg !== "" ? parseFloat(s.weight_kg) : null,
            }))
            .filter((s) => s.reps !== null || s.weight_kg !== null),
        })),
      });

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Workout saved!");
        router.push(`/workouts/${result.workoutId}`);
      }
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-ubuntu text-37 text-matteBlack bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-green-primary focus:outline-none flex-1 min-w-0 transition placeholder:text-gray-300"
          placeholder="Workout Title"
        />
        <button
          type="button"
          onClick={handleFinish}
          disabled={isPending}
          className="shrink-0 bg-green-primary text-creme px-5 py-2.5 rounded-md font-quicksand font-semibold text-16 hover:brightness-110 transition disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Finish"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {exercises.length === 0 && !showSearch && (
          <p className="font-quicksand text-16 text-gray-400 text-center py-10">
            Add your first exercise below to get started.
          </p>
        )}

        {exercises.map((ex) => (
          <div
            key={ex.uid}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-ubuntu text-20 text-matteBlack leading-snug">
                  {ex.displayName}
                </h3>
                <span className="font-quicksand text-xs text-gray-400 capitalize">
                  {ex.equipment}
                  {ex.library_id === null && (
                    <span className="ml-2 text-green-primary">· custom</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeExercise(ex.uid)}
                className="text-gray-300 hover:text-red-400 transition p-1 -mt-1 -mr-1"
                aria-label="Remove exercise"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-[36px_1fr_1fr_28px] gap-2 mb-1.5 px-1">
              <span className="font-quicksand text-xs text-gray-400 text-center">
                Set
              </span>
              <span className="font-quicksand text-xs text-gray-400 text-center">
                Reps
              </span>
              <span className="font-quicksand text-xs text-gray-400 text-center">
                lbs
              </span>
              <span />
            </div>

            {ex.sets.map((set, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[36px_1fr_1fr_28px] gap-2 mb-2 items-center"
              >
                <span className="font-quicksand text-14 text-gray-400 text-center">
                  {idx + 1}
                </span>
                <input
                  type="number"
                  min="0"
                  value={set.reps}
                  onChange={(e) =>
                    updateSet(ex.uid, idx, "reps", e.target.value)
                  }
                  placeholder="—"
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-center font-quicksand text-14 text-matteBlack focus:outline-none focus:border-green-primary transition"
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight_kg}
                  onChange={(e) =>
                    updateSet(ex.uid, idx, "weight_kg", e.target.value)
                  }
                  placeholder="—"
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-center font-quicksand text-14 text-matteBlack focus:outline-none focus:border-green-primary transition"
                />
                <button
                  type="button"
                  onClick={() => removeSet(ex.uid, idx)}
                  disabled={ex.sets.length === 1}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-0 disabled:pointer-events-none transition"
                  aria-label="Remove set"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {quickFillOpen[ex.uid] ? (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-quicksand text-14 text-matteBlack">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quickFillDraft[ex.uid]?.sets ?? ""}
                    onChange={(e) =>
                      updateQuickFill(ex.uid, "sets", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && applyQuickFill(ex.uid)
                    }
                    placeholder="sets"
                    autoFocus
                    className="w-14 rounded-md border border-gray-200 px-2 py-1 text-center focus:outline-none focus:border-green-primary transition"
                  />
                  <span className="text-gray-400">×</span>
                  <input
                    type="number"
                    min="1"
                    value={quickFillDraft[ex.uid]?.reps ?? ""}
                    onChange={(e) =>
                      updateQuickFill(ex.uid, "reps", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && applyQuickFill(ex.uid)
                    }
                    placeholder="reps"
                    className="w-14 rounded-md border border-gray-200 px-2 py-1 text-center focus:outline-none focus:border-green-primary transition"
                  />
                  <span className="text-gray-400">@</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={quickFillDraft[ex.uid]?.weight ?? ""}
                    onChange={(e) =>
                      updateQuickFill(ex.uid, "weight", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && applyQuickFill(ex.uid)
                    }
                    placeholder="lbs"
                    className="w-16 rounded-md border border-gray-200 px-2 py-1 text-center focus:outline-none focus:border-green-primary transition"
                  />
                  <span className="text-gray-400 text-xs">lbs</span>
                </div>
                <button
                  type="button"
                  onClick={() => applyQuickFill(ex.uid)}
                  className="font-quicksand text-14 font-semibold text-green-primary hover:opacity-70 transition"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => closeQuickFill(ex.uid)}
                  className="text-gray-300 hover:text-gray-500 transition"
                  aria-label="Cancel quick fill"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => addSet(ex.uid)}
                  className="flex items-center gap-1 font-quicksand text-14 text-green-primary hover:opacity-70 transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Set
                </button>
                <button
                  type="button"
                  onClick={() => openQuickFill(ex.uid)}
                  className="flex items-center gap-1 font-quicksand text-14 text-gray-400 hover:text-green-primary transition"
                >
                  Quick fill
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {showSearch ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredLibrary.length === 0)
                    addCustomExercise();
                  if (e.key === "Escape") {
                    setShowSearch(false);
                    setSearchQuery("");
                  }
                }}
                placeholder="Search exercises…"
                className="flex-1 font-quicksand text-14 text-matteBlack placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close search"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredLibrary.slice(0, 40).map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addLibraryExercise(ex)}
                  className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 transition"
                >
                  <span className="font-quicksand text-14 text-matteBlack">
                    {ex.name}
                  </span>
                  <span className="font-quicksand text-xs text-gray-400 capitalize ml-4 shrink-0">
                    {ex.equipment}
                  </span>
                </button>
              ))}

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={addCustomExercise}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-gray-50 transition border-t border-gray-100"
                >
                  <PlusIcon className="w-4 h-4 text-green-primary shrink-0" />
                  <span className="font-quicksand text-14 text-green-primary">
                    Add &ldquo;{searchQuery.trim()}&rdquo; as custom exercise
                  </span>
                </button>
              )}

              {!filteredLibrary.length && !searchQuery.trim() && (
                <p className="font-quicksand text-14 text-gray-400 px-4 py-6 text-center">
                  No exercises found.
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl p-4 font-quicksand text-14 text-gray-400 hover:border-green-primary hover:text-green-primary transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add Exercise
          </button>
        )}
      </div>
    </div>
  );
}
