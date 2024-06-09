import { ContentContainer } from "@/components/ContentContainer";
import { StatsPreview } from "@/components/StatsPreview";
import { WorkoutCallToAction } from "@/components/WorkoutCallToAction";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return (
        <section className="w-full flex flex-col items-center">
            <ContentContainer>
                <WorkoutCallToAction />
                <StatsPreview />
            </ContentContainer>
        </section>
    );
}
