import { createClient } from "@/utils/supabase/server";

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function formatWeekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatVolume(lbs: number): string {
  if (lbs >= 1_000_000) return `${(lbs / 1_000_000).toFixed(1)}M`;
  if (lbs >= 1_000) return `${Math.round(lbs / 1_000)}k`;
  return Math.round(lbs).toString();
}

type SetRow = { reps: number | null; weight_kg: number | null };
type ExerciseRow = { sets: SetRow[] };
type WorkoutRow = { id: string; exercises: ExerciseRow[] };

export const StatsPreview = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { start, end } = getWeekBounds();
  const weekLabel = formatWeekLabel(start);

  let workoutCount = 0;
  let totalVolumeLbs = 0;
  let totalSets = 0;

  if (user) {
    const { data } = await supabase
      .from("workouts")
      .select("id, exercises ( sets ( reps, weight_kg ) )")
      .eq("user_id", user.id)
      .gte("completed_at", start.toISOString())
      .lt("completed_at", end.toISOString());

    const workouts = (data ?? []) as unknown as WorkoutRow[];
    workoutCount = workouts.length;

    for (const w of workouts) {
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          if (s.reps != null && s.weight_kg != null) {
            totalVolumeLbs += s.reps * s.weight_kg * 2.205;
            totalSets++;
          } else if (s.reps != null) {
            totalSets++;
          }
        }
      }
    }
  }

  const estimatedCalories = Math.round(totalVolumeLbs * 0.04);

  const stats = [
    {
      label: "Workouts",
      value: workoutCount.toString(),
      sub: "this week",
    },
    {
      label: "Volume Lifted",
      value: totalVolumeLbs > 0 ? `${formatVolume(totalVolumeLbs)} lbs` : "—",
      sub: "total lbs moved",
    },
    {
      label: "Est. Calories",
      value:
        estimatedCalories > 0 ? `~${estimatedCalories.toLocaleString()}` : "—",
      sub: "burned this week",
    },
  ];

  return (
    <div className="bg-linear-to-r from-gray-50 to-green-primary/50 py-12 mt-32 rounded-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-4 px-1">
          <h2 className="font-ubuntu text-20 tracking-light text-matteBlack">
            This Week&apos;s Stats
          </h2>

          <span className="font-quicksand text-14 text-green-primary font-bold">
            {weekLabel}
          </span>
        </div>

        <dl className="rounded-lg bg-white shadow-lg grid grid-cols-1 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                "flex flex-col p-6 text-center",
                i === 0
                  ? "border-b sm:border-b-0 sm:border-r border-gray-100"
                  : i === 1
                    ? "border-b sm:border-b-0 sm:border-l sm:border-r border-gray-100"
                    : "border-t sm:border-t-0 sm:border-l border-gray-100",
              ].join(" ")}
            >
              <dt className="order-3 mt-1 font-quicksand text-13 text-gray-400">
                {stat.sub}
              </dt>
              <dd className="order-1 font-ubuntu text-48 font-bold tracking-tight text-green-primary leading-none">
                {stat.value}
              </dd>
              <dt className="order-2 mt-2 font-quicksand text-16 font-medium text-matteBlack">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
