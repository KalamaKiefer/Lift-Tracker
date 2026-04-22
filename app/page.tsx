import { HomeHero } from "@/components/HomeHero";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) return redirect("/home");

    return (
        <div className="h-svh">
            <HomeHero />
        </div>
    );
}
