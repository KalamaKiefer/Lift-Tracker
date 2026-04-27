import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ContentContainer } from "@/components/ContentContainer";
import { WorkoutsView } from "./WorkoutsView";

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
    .limit(200);

  const workoutItems = (workouts ?? []).map((w) => ({
    id: w.id,
    title: w.title,
    completed_at: w.completed_at,
    exerciseCount: Array.isArray(w.exercises) ? w.exercises.length : 0,
  }));

  return (
    <ContentContainer>
      <WorkoutsView workouts={workoutItems} />
    </ContentContainer>
  );
}
