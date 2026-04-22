import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ContentContainer } from "@/components/ContentContainer";
import Link from "next/link";
import { BarbellIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, title, completed_at, exercises(id)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(25);

  return (
    <ContentContainer>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-ubuntu text-37 text-matteBlack">Workouts</h1>
        <Link
          href="/workouts/new"
          className="flex items-center gap-2 bg-green-primary text-creme px-4 py-2 rounded-md font-quicksand font-semibold text-16 hover:brightness-110 transition"
        >
          <PlusIcon className="w-4 h-4" weight="bold" />
          New Workout
        </Link>
      </div>

      {!workouts?.length ? (
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => {
            const date = new Date(workout.completed_at);
            const exerciseCount = Array.isArray(workout.exercises)
              ? workout.exercises.length
              : 0;

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
                  {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </ContentContainer>
  );
}
