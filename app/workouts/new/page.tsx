import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ContentContainer } from "@/components/ContentContainer";
import Link from "next/link";
import { WorkoutBuilder } from "./WorkoutBuilder";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

export default async function NewWorkoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exercises } = await supabase
    .from("exercise_library")
    .select("id, name, muscle_groups, equipment")
    .eq("is_custom", false)
    .order("name");

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

      <WorkoutBuilder exercises={exercises ?? []} />
    </ContentContainer>
  );
}
