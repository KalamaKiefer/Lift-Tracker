"use server";

import { createClient } from "@/utils/supabase/server";

type SetInput = {
  set_index: number;
  reps: number | null;
  weight_kg: number | null;
};

type ExerciseInput = {
  library_id: string | null;
  custom_name: string | null;
  order_index: number;
  sets: SetInput[];
};

type CreateWorkoutInput = {
  title: string;
  notes: string;
  exercises: ExerciseInput[];
};

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<{ workoutId: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      title: input.title,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (workoutError || !workout) return { error: "Failed to save workout." };

  for (const ex of input.exercises) {
    const { data: exercise, error: exError } = await supabase
      .from("exercises")
      .insert({
        workout_id: workout.id,
        library_id: ex.library_id,
        custom_name: ex.custom_name,
        order_index: ex.order_index,
      })
      .select("id")
      .single();

    if (exError || !exercise) return { error: "Failed to save exercise." };

    if (ex.sets.length > 0) {
      const { error: setsError } = await supabase.from("sets").insert(
        ex.sets.map((s) => ({
          exercise_id: exercise.id,
          set_index: s.set_index,
          reps: s.reps,
          weight_kg: s.weight_kg,
        }))
      );

      if (setsError) return { error: "Failed to save sets." };
    }
  }

  return { workoutId: workout.id };
}
