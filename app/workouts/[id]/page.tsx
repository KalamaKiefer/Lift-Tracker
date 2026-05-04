import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContentContainer } from "@/components/ContentContainer";
import Link from "next/link";
import { ArrowLeftIcon, BarbellIcon } from "@phosphor-icons/react/dist/ssr";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      `
      id,
      title,
      notes,
      completed_at,
      exercises (
        id,
        custom_name,
        order_index,
        exercise_library ( name, muscle_groups, equipment ),
        sets ( id, set_index, reps, weight_kg )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!workout) notFound();

  const sortedExercises = [...(workout.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const date = new Date(workout.completed_at);
  const totalSets = sortedExercises.reduce(
    (acc, ex) => acc + (ex.sets?.length ?? 0),
    0,
  );

  return (
    <ContentContainer>
      <div className="mb-6">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-1.5 font-quicksand text-14 text-gray-400 hover:text-matteBlack transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Workouts
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-ubuntu text-37 text-matteBlack">{workout.title}</h1>
        <p className="font-quicksand text-16 text-gray-400 mt-1">
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {workout.notes && (
          <p className="font-quicksand text-14 text-gray-500 mt-3 italic">
            {workout.notes}
          </p>
        )}
        <div className="flex items-center gap-6 mt-4">
          <Stat label="Exercises" value={sortedExercises.length} />
          <Stat label="Total Sets" value={totalSets} />
        </div>
      </div>

      {sortedExercises.length === 0 ? (
        <p className="font-quicksand text-16 text-gray-400">
          No exercises were logged.
        </p>
      ) : (
        <div className="flex flex-col gap-5 max-w-2xl">
          {sortedExercises.map((ex) => {
            type LibRow = { name: string; equipment: string } | null;
            const libRow = ex.exercise_library as unknown as LibRow;
            const name = libRow?.name ?? ex.custom_name ?? "Exercise";
            const equipment = libRow?.equipment;
            const sortedSets = [...(ex.sets ?? [])].sort(
              (a, b) => a.set_index - b.set_index,
            );

            return (
              <div
                key={ex.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarbellIcon className="w-5 h-5 text-green-primary shrink-0" />
                  <div>
                    <h3 className="font-ubuntu text-20 text-matteBlack leading-snug">
                      {name}
                    </h3>
                    {equipment && (
                      <span className="font-quicksand text-xs text-gray-400 capitalize">
                        {equipment}
                        {!libRow && (
                          <span className="ml-2 text-green-primary">
                            · custom
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {sortedSets.length === 0 ? (
                  <p className="font-quicksand text-14 text-gray-400 italic">
                    No sets recorded.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="font-quicksand text-xs text-gray-400 text-left pb-2 w-12">
                          Set
                        </th>
                        <th className="font-quicksand text-xs text-gray-400 text-left pb-2">
                          Reps
                        </th>
                        <th className="font-quicksand text-xs text-gray-400 text-left pb-2">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSets.map((set, idx) => (
                        <tr key={set.id} className="border-t border-gray-100">
                          <td className="font-quicksand text-14 text-gray-400 py-2">
                            {idx + 1}
                          </td>
                          <td className="font-quicksand text-14 text-matteBlack py-2">
                            {set.reps ?? "—"}
                          </td>
                          <td className="font-quicksand text-14 text-matteBlack py-2">
                            {set.weight_kg != null
                              ? `${set.weight_kg} lbs`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ContentContainer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-quicksand text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-ubuntu text-24 text-green-primary">{value}</p>
    </div>
  );
}
